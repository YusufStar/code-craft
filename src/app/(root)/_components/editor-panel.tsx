"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  RotateCcwIcon,
  ServerIcon,
  SettingsIcon,
  ShareIcon,
  TypeIcon,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import useMounted from "@/hooks/useMounted";
import { EditorPanelSkeleton } from "./editor-panel-skeleton";
import ShareSnippetDialog from "./share-snippet-dialog";
import LiveShareSnippetDialog from "./live-share-snippet-dialog";
import { useSocketStore } from "@/store/useSocketStore";

type Participant = {
  email: string;
  canEdit: boolean;
  canRunCode: boolean;
};

function EditorPanel() {
  const { socket, setRoomId } = useSocketStore();

  const clerk = useClerk();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLiveShareDialogOpen, setIsLiveShareDialogOpen] = useState(false);
  const [liveShare, setLiveShare] = useState<null | {
    liveShareCode: string;
    participants: Participant[];
  }>(null);
  const {
    language,
    theme,
    fontSize,
    editor,
    setFontSize,
    setEditor,
    livePermission,
    setLivePermission,
  } = useCodeEditorStore();

  const mounted = useMounted();

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(newCode);
  }, [language, editor]);

  useEffect(() => {
    const handleCodeUpdate = ({
      code,
      senderId,
    }: {
      code: string;
      senderId: string;
    }) => {
      if (!socket) return;
      if (socket.id !== senderId && editor) {
        const currentValue = editor.getValue();
        if (currentValue !== code) {
          editor.setValue(code);
        }
      }
    };

    const updateParti = (
      participants: Record<string, { canEdit: boolean; canRunCode: boolean }>
    ) => {
      const participantsArray = Object.entries(participants).map(
        ([email, permissions]) => ({
          email,
          ...permissions,
        })
      );
      setLiveShare((prev) =>
        prev ? { ...prev, participants: participantsArray } : null
      );
    };

    if (!socket) return;

    socket.on("updateParticipants", updateParti);

    socket.on("codeUpdate", handleCodeUpdate);

    return () => {
      socket.off("codeUpdate", handleCodeUpdate);
      socket.off("updateParticipants", handleCodeUpdate);
    };
  }, [editor, socket]);

  useEffect(() => {
    setRoomId(liveShare?.liveShareCode as string);
    setLivePermission(
      liveShare?.participants.find(
        (q) => q.email === clerk.user?.emailAddresses[0].emailAddress
      )
    );
  }, [liveShare]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (livePermission !== null) {
      if (!livePermission?.canEdit) return;

      if (value && socket) {
        localStorage.setItem(`editor-code-${language}`, value);
        socket.emit("codeChange", {
          roomId: liveShare?.liveShareCode,
          code: value,
        });
      }
    }
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

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLiveShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-green-600 animate-pulse opacity-90 hover:opacity-100 transition-opacity"
            >
              {useSocketStore.getState().roomId ? (
                <>
                  <SettingsIcon className="size-4 text-white" />
                  <span className="text-sm font-medium text-white ">
                    Live Settings
                  </span>
                </>
              ) : (
                <>
                  <ServerIcon className="size-4 text-white" />
                  <span className="text-sm font-medium text-white ">
                    Live Share
                  </span>
                </>
              )}
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShareIcon className="size-4 text-white" />
              <span className="text-sm font-medium text-white ">Share</span>
            </motion.button>
          </div>
        </div>

        {/* Editor  */}
        <div className="relative h-[600px] group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded && (
            <Editor
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

          {!clerk.loaded && <EditorPanelSkeleton />}
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
