import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { ProblemState } from "@/types";
import { Monaco } from "@monaco-editor/react";
import { create } from "zustand";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 14,
      theme: "vs-dark",
    };
  }

  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-fontSize") || 14;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useProblemEditorStore = create<ProblemState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    runtimes: [],
    selectedVersion: "18.15.0",

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme: theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-fontSize", fontSize.toString());
      set({ fontSize: fontSize });
    },

    setLanguage: (language: string) => {
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      const savedVersion =
        localStorage.getItem(`editor-${language}-version`) ||
        LANGUAGE_CONFIG[language]?.pistonRuntime.version;

      localStorage.setItem(`editor-${language}-version`, savedVersion);
      localStorage.setItem("editor-language", language);

      set({
        language,
        selectedVersion: savedVersion,
        output: "",
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await response.json();

        // Check if an error message exists in the response
        if (data.message) {
          set({
            error: data.message,
            executionResult: { code, output: "", error: data.message },
          });
          return;
        }

        // Check for compile errors
        if (data.compile?.code !== undefined && data.compile.code !== 0) {
          const error =
            data.compile.stderr || data.compile.output || "Compilation error";
          set({
            error,
            executionResult: { code, output: "", error },
          });
          return;
        }

        // Check for runtime errors
        if (data.run?.code !== undefined && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output || "Runtime error";
          set({
            error,
            executionResult: { code, output: "", error },
          });
          return;
        }

        // Handle successful execution
        const output = data.run?.output?.trim() || "";
        set({
          output,
          error: null,
          executionResult: { code, output, error: null },
        });
      } catch (error) {
        console.error("Error running code:", error);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () =>
  useProblemEditorStore.getState().executionResult;
