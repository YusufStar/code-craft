import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { Problem, ProblemState } from "@/types";
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
    currentTab: "description",
    executionResult: null,
    loadingProblem: false, // Track loading state of problem
    currentProblemId: null, // Store the ID of the current problem
    currentProblem: null, // Store the problem data

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: Monaco) => {
      if (!editor) return;
      set({ editor });
    },

    loadDefaultProblemCode: () => {
      const savedCode = get().currentProblem?.languages.find(
        ({ language }) =>
          get().language.toLowerCase() === language.toLocaleLowerCase()
      );
      console.log(savedCode);
      console.log(get().editor);
      get().editor?.setValue(savedCode?.starterTemplate);
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

      const savedVersion = LANGUAGE_CONFIG[language]?.pistonRuntime.version;

      localStorage.setItem(`editor-${language}-version`, savedVersion);
      localStorage.setItem("editor-language", language);

      get().loadDefaultProblemCode();

      set({
        language,
        output: "",
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      set({
        currentTab: "output",
      });

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

    getProblemWithId: async (problemData: Problem) => {
      set({ loadingProblem: true, currentProblemId: problemData._id });

      try {
        set({
          currentProblem: problemData,
          loadingProblem: false,
        });
      } catch (error) {
        console.error("Error fetching problem:", error);
        set({
          loadingProblem: false,
          error: "Error fetching problem data",
        });
      }
    },
  };
});

export const getExecutionResult = () =>
  useProblemEditorStore.getState().executionResult;
