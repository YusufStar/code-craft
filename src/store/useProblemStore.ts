import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { Problem, ProblemState } from "@/types";
import { Monaco } from "@monaco-editor/react";
import { create } from "zustand";

const getInitialState = () => {
  if (typeof window === "undefined") {
    console.log("Running on server");
    return {
      language: "javascript",
      fontSize: 14,
      theme: "vs-dark",
    };
  }

  console.log("Running on client");
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
    output: null,
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
      if (!editor) {
        console.error("Monaco editor is not initialized");
        return;
      }
      set({ editor });
    },

    loadDefaultProblemCode: () => {
      const savedCode = get().currentProblem?.languages?.find(
        ({ language }) =>
          get().language.toLowerCase() === language.toLocaleLowerCase()
      );
      if (!savedCode?.starterTemplate) {
        set({
          language:
            get().currentProblem?.languages[0].language.toLocaleLowerCase(),
        });
      }
      get().editor?.setValue(
        savedCode?.starterTemplate ??
          get().currentProblem?.languages[0].starterTemplate
      );
      return;
    },
    getDefaultProblemCode: () => {
      const savedCode = get().currentProblem?.languages.find(
        ({ language }) =>
          get().language.toLowerCase() === language.toLocaleLowerCase()
      );
      if (!savedCode?.starterTemplate) {
        set({
          language:
            get().currentProblem?.languages[0].language.toLocaleLowerCase(),
        });
      }
      return (
        savedCode?.starterTemplate ??
        get().currentProblem?.languages[0].starterTemplate
      );
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

      const languageConfig = LANGUAGE_CONFIG[language];
      if (!languageConfig) {
        console.error(`Language configuration for ${language} is missing`);
        return;
      }
      const savedVersion = languageConfig.pistonRuntime.version;

      localStorage.setItem(`editor-${language}-version`, savedVersion);
      localStorage.setItem("editor-language", language);

      set({
        language,
        output: null,
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode, currentProblem } = get();
      const code = getCode();

      set({
        currentTab: "output",
      });

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: null });

      try {
        const languageConfig = LANGUAGE_CONFIG[language];
        if (!languageConfig) {
          console.error(`Language configuration for ${language} is missing`);
          return;
        }
        const runtime = languageConfig.pistonRuntime;
        const selectedLanguage = currentProblem?.languages.find(
          ({ language: lang }) => lang.toLowerCase() === language.toLowerCase()
        );

        if (!selectedLanguage) {
          set({
            error: "Selected language is not supported for this problem.",
            isRunning: false,
          });
          return;
        }

        const detailConfirm = [];
        let submissionConfirm = true;

        for (let i = 0; i < selectedLanguage.expectedOutput.length; i++) {
          const { key, value: expectedValue } =
            selectedLanguage.expectedOutput[i];

          if (languageConfig.outputWrapper === undefined) return;
          const modifiedCode = languageConfig.outputWrapper(code, key);

          const response = await fetch(
            "https://emkc.org/api/v2/piston/execute",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                language: runtime.language,
                version: runtime.version,
                files: [{ content: modifiedCode }],
              }),
            }
          );

          const data = await response.json();
          const actualOutput = data.run?.output?.trim() || "";
          if (!actualOutput) {
            console.error("Invalid API response: Output is empty or missing");
          }
          const result = (actualOutput as string).split("\n");

          const isCorrect = actualOutput.trim() === expectedValue.trim();
          detailConfirm.push({
            params: key,
            response: result[result.length - 1],
            expectedResponse: expectedValue,
          });

          if (!isCorrect) {
            submissionConfirm = false;
          }
        }

        set({
          output: { submissionConfirm, detailConfirm },
          error: null,
          executionResult: {
            code,
            output: { submissionConfirm, detailConfirm },
            error: null,
          },
        });
      } catch (error) {
        console.error("Error running code:", error);
        set({
          error: "Error running code",
          executionResult: { code, output: null, error: "Error running code" },
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
