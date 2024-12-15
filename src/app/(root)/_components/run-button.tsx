"use client";

import {
  getExecutionResult,
  useCodeEditorStore,
} from "@/store/useCodeEditorStore";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useSocketStore } from "@/store/useSocketStore";

function RunButton() {
  const { user } = useUser();
  const { runCode, language, isRunning, setLanguage, setVersion } =
    useCodeEditorStore();
  const { setRoomId } = useSocketStore();
  const saveExecution = useMutation(api.codeExecutions.saveExecution);
  const controlExecution = useMutation(api.codeExecutions.controlExecution);

  const handleRun = async () => {
    // if (!!roomId && !livePermission?.canRunCode) return;

    const { error, message } = (await controlExecution({ language })) as any;

    if (error) {
      const msg = !!message ? message : "Unexpected error occurred";
      setLanguage("javascript");
      setVersion("18.15.0");
      useCodeEditorStore.setState({
        error: msg,
        executionResult: {
          code: useCodeEditorStore.getState().getCode(),
          error: msg,
          output: null,
        },
      });
      setRoomId(null);
      return;
    }

    await runCode();
    const result = getExecutionResult();

    if (user && result) {
      await saveExecution({
        language,
        code: result.code,
        output:
          result.output?.detailConfirm
            .map(
              (item) => `
              ---------------------divider------------------------
              params: ${item.params}\n
              response: ${item.response}\n
              expectedResponse: ${item.expectedResponse}\n
              ---------------------divider-------------------------`
            )
            .join("\n") || undefined,
        error: result.error || undefined,
      });
    }
  };

  return (
    <motion.button
      onClick={handleRun}
      disabled={isRunning}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative inline-flex items-center gap-2.5 px-5 py-2.5
        disabled:cursor-not-allowed
        focus:outline-none
        disabled:opacity-50
      `}
    >
      {/* bg wit gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-100 transition-opacity group-hover:opacity-90" />

      <div className="relative flex items-center gap-2.5">
        {isRunning ? (
          <>
            <div className="relative">
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
              <div className="absolute inset-0 blur animate-pulse" />
            </div>
            <span className="text-sm font-medium text-white/90">
              Executing...
            </span>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center w-4 h-4">
              <Play className="w-4 h-4 text-white/90 transition-transform group-hover:scale-110 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-white/90 group-hover:text-white">
              Run Code
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
}
export default RunButton;
