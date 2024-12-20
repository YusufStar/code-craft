"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, ShareIcon, TypeIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import useMounted from "@/hooks/useMounted";
import { EditorPanelSkeleton } from "./editor-panel-skeleton";
import ShareSnippetDialog from "./share-snippet-dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useLiveStore } from "@/store/useLiveStore";
import useSocketStore from "@/store/useSocketStore";
import { io } from "socket.io-client";
import { Room } from "@/types";

function EditorPanel() {
  const clerk = useClerk();
  const { user } = useUser();
  const userData = useQuery(api.users.getUser, { userId: user?.id ?? "" });

  const { setConnectionStatus, setSocket, socket } = useSocketStore();

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const getCode = useMutation(api.codes.getCode);
  const saveOrUpdateCode = useMutation(api.codes.createOrUpdateCode);
  const [loading, setLoading] = useState(false);
  const [loadedLanguage, setLoadedLanguage] = useState("");

  const { room, setRoom } = useLiveStore();

  const { language, theme, fontSize, editor, setFontSize, setEditor, setCode } =
    useCodeEditorStore();

  const mounted = useMounted();

  const loadCode = async () => {
    if (!user || !userData) return;
    setLoading(true);
    if (loadedLanguage !== language) {
      setLoadedLanguage(language);
      const res = await getCode({ userId: userData?._id, language: language });
      if (!res) return;
      setCode(res.code ?? "");
    }
    setLoading(false);
  };

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_IP); // Connect to the server (defaults to localhost)
    setSocket(socket);

    socket.on("connect", () => {
      setConnectionStatus(true);
      console.log("Connected to socket server");
    });

    socket.on("disconnect", () => {
      setConnectionStatus(false);
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [setSocket, setConnectionStatus]);

  useEffect(() => {
    if (!socket) return;
    socket.on(
      "room-update",
      ({
        language,
        code,
        type,
        roomData,
        version,
        userId,
      }: {
        language: string;
        code: string;
        roomData: Room;
        userId: string;
        version: number;
        type: "language" | "code" | "permissions" | "new-user";
      }) => {
        if (type === "language") {
          if (!room) return;
          setRoom({
            ...room,
            language: language,
          });
        } else if (type === "code") {
          if (!room) {
            return;
          }
          if (userData && userId === userData?._id) {
            console.log("Code updated by self");
            return;
          }
          setRoom({
            ...room,
            code: code,
            version,
          });

          if (editor && code !== editor.getValue()) {
            editor.setValue(code);
          }
        } else if (type === "permissions") {
          setRoom(roomData);
        } else if (type === "new-user") {
          setRoom(roomData);
        }
      }
    );
  }, [room, userData, socket]);

  useEffect(() => {
    if (editor && !room) loadCode();
  }, [language, editor, room, userData, user]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    console.log("refresh");
  };

  const saveCode = async (value: string) => {
    if (!userData) return;
    await saveOrUpdateCode({
      userId: userData?._id,
      language: language,
      code: value,
    });
  };

  const handleEditorChange = async (value: string | undefined) => {
    if (typeof value === "string" && !room) {
      await saveCode(value);
    } else if (typeof value === "string" && room) {
      if (!socket) return;
      socket.emit("update-code", {
        roomId: room.id,
        code: value,
        userId: userData?._id,
        version: room.version
      });
    }
  };

  useEffect(() => {
    if (!room) return;
    if (room?.code && editor && room?.code !== editor.getValue()) {
      editor.setValue(room.code);
    }
  }, [room?.code, editor]);

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
              className={`${loading ? "hidden" : "block"} w-full h-full`}
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor) => {
                setEditor(editor);
              }}
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

          {!clerk.loaded || (loading && <EditorPanelSkeleton />)}
        </div>
      </div>

      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}
    </div>
  );
}

export default EditorPanel;
