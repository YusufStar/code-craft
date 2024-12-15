"use client";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DockIcon,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RunningCodeSkeleton from "./running-code-skeleton";
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
  const { output, error, isRunning, currentProblem, currentTab } =
    useProblemEditorStore();
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });

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

  return (
    <div className="relative h-full bg-[#181825] rounded-xl p-6 ring-1 ring-gray-800/50">
      {/* Header */}
      <div className="relative flex items-center justify gap-2.5 h-[36px] mb-4">
        {/* Tab buttons */}
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

        {/* AI Assistant Tab */}
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
            <DockIcon className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors duration-200">
            Description
          </span>
        </div>

        {output?.submissionConfirm && (
          <>
            <a className="relative inline-flex items-center justify-center px-4 py-2 overflow-hidden font-mono font-medium text-sm tracking-tighter text-white bg-gray-800 rounded-lg group">
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
              <span className="relative">Share Submission</span>
            </a>
          </>
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
                <div className="space-y-4">
                  {/* Execution Status */}
                  {output.submissionConfirm ? (
                    <div className="flex items-center gap-2 text-emerald-400 mb-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Submission Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400/80 mb-3">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Submission Incorrect</span>
                    </div>
                  )}

                  {/* Actual Output Section */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-200">
                      Difference Output
                    </h3>
                    <div className="flex flex-col gap-4 whitespace-pre-wrap text-gray-300">
                      {output.detailConfirm.map(
                        (
                          { expectedResponse, params, response },
                          idx: number
                        ) => (
                          <div className="flex flex-col gap-1" key={idx}>
                            <div className="flex items-center gap-1">
                              <span>Params: </span>
                              <span>{params}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>Expected Response: </span>
                              <span>{expectedResponse}</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 ${expectedResponse === response ? "text-emerald-400" : "text-red-400"}`}
                            >
                              <span>Actual Response: </span>
                              <span>{response}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
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
