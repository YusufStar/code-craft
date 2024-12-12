import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { CodeEditorState } from "@/types";
import { Monaco } from "@monaco-editor/react";
import { create } from "zustand";

const getInitialState = () => {
    if (typeof window === "undefined") {
        return {
            language: "javascript",
            fontSize: 14,
            theme: "vs-dark"
        }
    }

    const savedLanguage = localStorage.getItem("editor-language") || "javascript"
    const savedTheme = localStorage.getItem("editor-theme") || "vs-dark"
    const savedFontSize = localStorage.getItem("editor-fontSize") || 14

    return {
        language: savedLanguage,
        theme: savedTheme,
        fontSize: Number(savedFontSize)
    }
}

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const initialState = getInitialState();

    return {
        ...initialState,
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => get().editor?.getValue() || "",

        setEditor: (editor: Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}`)
            if (savedCode) editor.setValue(savedCode);
            set({ editor })
        },

        setTheme: (theme: string) => {
            localStorage.setItem("editor-theme", theme)
            set({ theme: theme })
        },

        setFontSize: (fontSize: number) => {
            localStorage.setItem("editor-fontSize", fontSize.toString())
            set({ fontSize: fontSize })
        },

        setLanguage: (language: string) => {
            const currentCode = get().editor?.getValue();
            if (currentCode) {
                localStorage.setItem(`editor-code-${get().language}`, currentCode)
            }

            localStorage.setItem("editor-language", language)

            set({
                language: language,
                output: "",
                error: null
            })
        },

        runCode: async () => {
            const { language, getCode } = get()
            const code = getCode()

            if (!code) {
                set({ error: "Please enter some code" })
                return
            }

            set({ isRunning: true, error: null, output: "" })

            try {
                const runtime = LANGUAGE_CONFIG[language].pistonRuntime
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        language: runtime.language,
                        version: runtime.version,
                        files: [{ content: code }]
                    })
                })

                const data = await response.json()

                console.log("data back from piston: ", data)

                if (data.message) {
                    set({ error: data.message, executionResult: { code, output: "", error: data.message } })
                }

                if (data.compile && data.compile.code !== 0) {
                    const error = data.compile.stderr || data.compile.output;
                    set({
                        error,
                        executionResult: {
                            code,
                            output: "",
                            error
                        }
                    })
                    return
                }

                if (data.run && data.run.code !== 0) {
                    const error = data.run.stderr || data.run.output
                    set({
                        error,
                        executionResult: {
                            code,
                            output: "",
                            error
                        }
                    })
                    return
                }

                const output = data.run.output
                set({
                    output: output,
                    error: null,
                    executionResult: {
                        code,
                        output: output.trim(),
                        error: null
                    }
                })
            } catch (error) {
                console.log("Error running code: ", error)
                set({
                    error: "Error running code", executionResult: {
                        code, output: "", error: "Error running code",
                    }
                })
            } finally {
                set({ isRunning: false })
            }
        }
    }
})

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult