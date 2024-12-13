"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import {
  AlertTriangle,
  ArrowUpFromLine,
  CheckCircle,
  Clock,
  Code,
  Copy,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RunningCodeSkeleton from "./running-code-skeleton";
import { useSocketStore } from "@/store/useSocketStore";
import useAi from "@/hooks/useAi";
import CommentContent from "./CommentContent";
import { LANGUAGE_CONFIG } from "../_constants";

function OutputPanel() {
  const { socket, roomId } = useSocketStore();
  const [maxHeight] = useState(300);
  const { output, error, isRunning, editor } = useCodeEditorStore();
  const [isCopied, setIsCopied] = useState(false);
  const [currentTab, setCurrentTab] = useState<"output" | "ai">("output");

  const [message, setMessage] = useState("");
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const { messages, setMessages } = useAi();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup state
  const popupRef = useRef<HTMLDivElement | null>(null); // Popup reference

  const hasContent = error || output;
  const tabRefs = {
    output: useRef<HTMLDivElement | null>(null),
    ai: useRef<HTMLDivElement | null>(null),
  };

  useEffect(() => {
    if (textareaRef.current) {
      // Auto resize the text area based on content
      textareaRef.current.style.height = "auto"; // Reset the height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [message, maxHeight]);

  useEffect(() => {
    if (tabRefs[currentTab].current) {
      const { offsetWidth, offsetLeft } = tabRefs[currentTab].current;
      setUnderlineStyle({ width: offsetWidth, left: offsetLeft });
    }
  }, [currentTab]);

  useEffect(() => {
    if (editor) {
      socket?.emit("responseChange", {
        roomId,
        response: {
          output,
          error,
          isRunning,
        },
      });
    }
  }, [output, error, isRunning, editor, roomId, socket]);

  useEffect(() => {
    const updateResponse = ({
      output,
      error,
      isRunning,
      senderId,
    }: {
      output: string;
      error: string;
      isRunning: boolean;
      senderId: string;
    }) => {
      if (!socket) return;
      if (socket.id !== senderId) {
        useCodeEditorStore.setState({
          output,
          error,
          isRunning,
          executionResult: {
            error,
            output,
            code: useCodeEditorStore.getState().getCode(),
          },
        });
      }
    };

    if (!socket) return;
    socket.on("responseUpdate", updateResponse);

    return () => {
      socket.off("responseUpdate", updateResponse);
    };
  }, [socket]);

  const handleCopy = async () => {
    if (!hasContent) return;
    await navigator.clipboard.writeText(error || output);
    setIsCopied(true);

    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    setMessages({
      role: "user",
      content: message,
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents the default newline behavior
      handleSendMessage(); // Call send message function
    }
  };

  // Handle popup close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle language selection from popup
  const handleLanguageSelect = (langId: string) => {
    setMessage(
      (prevMessage) =>
        `${prevMessage}\n\`\`\`${langId}\n//Please enter your code here\n\`\`\``
    );
    setIsPopupOpen(false);
  };

  return (
    <div className="relative bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50">
      {/* Header */}
      <div className="relative flex items-center justify gap-2.5 mb-3">
        <div
          ref={tabRefs.output}
          onClick={() => setCurrentTab("output")}
          className={`group cursor-pointer relative flex items-center gap-2 px-2 py-1 bg-[#1e1e2e]/80 
            rounded-lg transition-all
            hover:opacity-100
            ${currentTab === "output" ? "opacity-100" : "opacity-50"}
             duration-200 border border-gray-800/50 hover:border-gray-700`}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
            <Terminal className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors duration-200">
            Output
          </span>
        </div>

        <div
          ref={tabRefs.ai}
          onClick={() => setCurrentTab("ai")}
          className={`group cursor-pointer relative flex items-center gap-2 px-2 py-1 bg-[#1e1e2e]/80 
      rounded-lg transition-all
      hover:opacity-100
      ${currentTab === "ai" ? "opacity-100" : "opacity-50"}
       duration-200 border border-gray-800/50 hover:border-gray-700`}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors duration-200">
            AI Assistant
          </span>
        </div>

        {hasContent && currentTab === "output" && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-300 bg-[#1e1e2e] 
            rounded-lg ring-1 ring-gray-800/50 hover:ring-gray-700/50 transition-all"
          >
            {isCopied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}

        <div
          className="absolute -bottom-2 rounded-xl left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
          style={{
            width: underlineStyle.width,
            transform: `translateX(${underlineStyle.left}px)`,
          }}
        />
      </div>

      {/* Output Area */}
      <AnimatePresence mode="wait">
        {currentTab === "output" && (
          <motion.div
            key="output"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div
              className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm"
            >
              {isRunning ? (
                <RunningCodeSkeleton />
              ) : error ? (
                <div className="flex items-start gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1" />
                  <div className="space-y-1">
                    <div className="font-medium">Execution Error</div>
                    <pre className="whitespace-pre-wrap text-red-400/80">
                      {error}
                    </pre>
                  </div>
                </div>
              ) : output ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Execution Successful</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-gray-300">
                    {output}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 ring-1 ring-gray-700/50 mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-center">
                    Run your code to see the output here...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentTab === "ai" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] rounded-xl p-4 h-[600px] overflow-auto font-mono text-sm">
                <div className="h-full flex flex-col items-center justify-between">
                  {messages.length > 0 ? (
                    messages.map((message, idx: number) => (
                      <CommentContent
                        key={idx}
                        role={message.role}
                        content={message.content as string}
                      />
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <p className="text-center">
                        Your AI Assistant results will appear here...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Textarea input */}
              <div className="w-full mt-4">
                <div className="flex items-end relative gap-2">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="px-4 py-2 pb-[3rem] w-full bg-[#1e1e2e] text-gray-300 border border-[#313244] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none overflow-hidden text-sm"
                    style={{ maxHeight: `${maxHeight}px` }} // Limit the height of the textarea
                  />

                  <div className="absolute flex items-center w-full left-2 bottom-2">
                    <button
                      className={`h-10 w-10 flex items-center justify-center rounded-full ${!isPopupOpen && "hover:bg-gray-700"} transition-all duration-200 ease-in-out`}
                      onClick={() => setIsPopupOpen((prev) => !prev)}
                    >
                      {isPopupOpen && (
                        <div
                          ref={popupRef}
                          className="absolute bottom-full h-[300px] z-50 max-h-[300px] overflow-auto left-0 mt-2 w-48 bg-[#1e1e2e] text-gray-300 rounded-lg shadow-lg border border-gray-700"
                        >
                          <ul className="space-y-1 p-2 h-[300px] max-h-[300px] z-50">
                            {Object.values(LANGUAGE_CONFIG).map(
                              (lang, index) => (
                                <li
                                  key={index}
                                  className="cursor-pointer text-sm text-left px-4 py-2 hover:bg-gray-700 rounded-lg"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLanguageSelect(lang.id);
                                  }}
                                >
                                  {lang.label}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      <Code className="w-4 h-4" />
                    </button>

                    <button
                      className="h-10 w-10 flex items-center ml-auto mr-4 justify-center rounded-full bg-gray-800/50 ring-1 ring-gray-700/50 hover:bg-gray-700 transition-all duration-200 ease-in-out"
                      onClick={handleSendMessage}
                    >
                      <ArrowUpFromLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OutputPanel;
