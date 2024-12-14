"use client";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RunningCodeSkeleton from "./running-code-skeleton";
import { useSocketStore } from "@/store/useSocketStore";
import { useProblemEditorStore } from "@/store/useProblemStore";
import Markdown from "react-markdown";
import remarkMdx from "remark-mdx";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkBreaks from "remark-breaks";
import CodeBlock from "./CodeBlock";

function OutputPanel() {
  const { socket, roomId } = useSocketStore();
  const { output, error, isRunning, editor, currentProblem, currentTab } =
    useProblemEditorStore();
  const [isCopied, setIsCopied] = useState(false);

  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });

  const hasContent = error || output;
  const tabRefs = {
    output: useRef<HTMLDivElement | null>(null),
    description: useRef<HTMLDivElement | null>(null),
  };

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
        useProblemEditorStore.setState({
          output,
          error,
          isRunning,
          executionResult: {
            error,
            output,
            code: useProblemEditorStore.getState().getCode(),
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

  return (
    <div className="relative h-full bg-[#181825] rounded-xl p-6 ring-1 ring-gray-800/50">
      {/* Header */}
      <div className="relative flex items-center justify gap-2.5 h-[36px] mb-4">
        <div
          ref={tabRefs.output}
          onClick={() =>
            useProblemEditorStore.setState({
              currentTab: "output",
            })
          }
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
          ref={tabRefs.description}
          onClick={() =>
            useProblemEditorStore.setState({
              currentTab: "description",
            })
          }
          className={`group cursor-pointer relative flex items-center gap-2 px-2 py-1 bg-[#1e1e2e]/80 
      rounded-lg transition-all
      hover:opacity-100
      ${currentTab === "description" ? "opacity-100" : "opacity-50"}
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
          className="absolute -bottom-2 rounded-xl left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
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
            className="relative flex flex-col max-h-[600px]"
          >
            <div
              className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px]  overflow-auto font-mono text-sm"
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

        {currentTab === "description" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col max-h-[600px]"
            >
              <div
                className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px]  overflow-auto font-mono text-sm"
              >
                <Markdown
                  className={"markdown"}
                  remarkPlugins={[
                    remarkMdx,
                    remarkMath,
                    remarkGfm,
                    remarkDirective,
                    remarkFrontmatter,
                    remarkBreaks,
                  ]}
                  components={{
                    //@ts-expect-error: Error
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline && match ? (
                        <CodeBlock
                          code={String(children).trim()}
                          language={match[0]?.replace("language-", "")}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {currentProblem?.description}
                </Markdown>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OutputPanel;
