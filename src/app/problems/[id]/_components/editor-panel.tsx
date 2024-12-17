"use client";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, TypeIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import useMounted from "@/hooks/useMounted";
import { EditorPanelSkeleton } from "./editor-panel-skeleton";
import ShareSnippetDialog from "./share-snippet-dialog";
import LiveShareSnippetDialog from "./live-share-snippet-dialog";
import { useProblemEditorStore } from "@/store/useProblemStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

type Participant = {
  email: string;
  canEdit: boolean;
  canRunCode: boolean;
};

function EditorPanel({ problemId }: { problemId: Id<"problems"> }) {
  const problemData = useQuery(api.problems.getProblem, {
    problemId: problemId,
  });
  const clerk = useClerk();
  const { user } = useUser();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLiveShareDialogOpen, setIsLiveShareDialogOpen] = useState(false);
  const [liveShare, setLiveShare] = useState<null | {
    liveShareCode: string;
    participants: Participant[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [loadedLanguage, setLoadedLanguage] = useState("");

  const saveOrUpdateCode = useMutation(api.codes.createOrUpdateCode);

  const {
    language,
    theme,
    fontSize,
    editor,
    setFontSize,
    setEditor,
    getProblemWithId,
    setCode,
  } = useProblemEditorStore();

  const mounted = useMounted();

  const loadCode = async () => {
    setLoading(true);
    if (!user) return;
    if (loadedLanguage !== language && problemData) {
      setLoadedLanguage(language);
      const finded = problemData.languages.find(
        (l) => l.language.toLowerCase() === language.toLowerCase()
      );
      setCode(finded?.starterTemplate ?? "");
      if (finded?.starterTemplate) {
        await saveCode(finded?.starterTemplate);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!problemData) return;
    getProblemWithId(problemData);
  }, [problemData]);

  useEffect(() => {
    if (editor && problemData) loadCode();
  }, [language, problemData]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    console.log("refresh");
  };

  const saveCode = async (value: string) => {
    if (!editor || !user || (!problemId && loadedLanguage === language)) return;
    await saveOrUpdateCode({
      userId: user.id,
      language: language,
      code: value,
      problemId: problemId,
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    console.log("editor changed value: ",value);
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

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

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Editor  */}
        <div className="relative h-[600px] group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded && (
            <Editor
              className={`${!problemData || loading ? "hidden" : "block"} w-full h-full`}
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
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

      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}
      {isLiveShareDialogOpen && (
        <LiveShareSnippetDialog
          liveShare={liveShare}
          setLiveShare={setLiveShare}
          onClose={() => setIsLiveShareDialogOpen(false)}
        />
      )}
    </div>
  );
}
export default EditorPanel;
