"use client";

import { useEffect, useState, useCallback } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import Image from "next/image";
import dynamic from "next/dynamic";
import { TypeIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import useMounted from "@/hooks/useMounted";
import { EditorPanelSkeleton } from "./editor-panel-skeleton";
import { getSelectedFile, useWebStore } from "@/store/useWebStore";
import { toast } from "sonner";

// Dynamically import MonacoEditor with proper loading and no SSR
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorPanelSkeleton />,
});

// Language configurations
const languages = [
  { language: "javascript", icon: "/javascript.png", extension: ".js" },
  { language: "typescript", icon: "/typescript.png", extension: ".ts" },
  { language: "python", icon: "/python.png", extension: ".py" },
  { language: "java", icon: "/java.png", extension: ".java" },
  { language: "svg", icon: "/svg.png", extension: ".svg" },
  { language: "gitignore", icon: "/gitignore.png", extension: ".gitignore" },
  { language: "json", icon: "/json.png", extension: ".json" },
  { language: "md", icon: "/md.png", extension: ".md" },
  { language: "css", icon: "/css.png", extension: ".css" },
];

function EditorPanel() {
  const clerk = useClerk();
  const [render, setRender] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    language,
    theme,
    fontSize,
    setFontSize,
    setEditor,
    selectedId,
    editor,
    setLanguage,
    updateFile,
    setSelectId,
  } = useWebStore();

  const mounted = useMounted();

  // Load font size from localStorage once during component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  // Handle editor content change
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (editor && selectedId) {
        updateFile(selectedId, { content: value });
      }
    },
    [editor, selectedId, updateFile]
  );

  // Handle font size change and persist to localStorage
  const handleFontSizeChange = useCallback(
    (newSize: number) => {
      const size = Math.min(Math.max(newSize, 12), 24);
      setFontSize(size);
      localStorage.setItem("editor-font-size", size.toString());
    },
    [setFontSize]
  );

  // Setting up language and editor content once the selected file is available
  useEffect(() => {
    setRender(false);
    if (editor && selectedId) {
      const file = getSelectedFile();
      if (!file?.isFolder) {
        const foundLang = languages.find(
          (l) => l.extension === file?.extension
        )?.language;
        if (!foundLang) return;

        const lang = LANGUAGE_CONFIG[foundLang];
        setLanguage(lang ? lang.monacoLanguage : "plaintext");
        editor?.setValue(file?.content || "");
        setRender(true);
      }
    }
  }, [selectedId, mounted, editor, setSelectId, setLanguage]);

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image
                src={"/" + language + ".png"}
                alt="Logo"
                width={24}
                height={24}
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">
                Write and execute your code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="relative h-[600px] group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded && (
            <MonacoEditor
              className={`${loading || !render ? "hidden" : "block"} w-full h-full`}
              height="600px"
              language={
                LANGUAGE_CONFIG[language]?.monacoLanguage ?? "plaintext"
              }
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor) => setEditor(editor)}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          )}

          {(!clerk.loaded || loading) && <EditorPanelSkeleton />}
        </div>
      </div>
    </div>
  );
}

export default EditorPanel;
