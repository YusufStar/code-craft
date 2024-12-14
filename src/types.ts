import { Monaco } from "@monaco-editor/react";
import { Id } from "../convex/_generated/dataModel";

export interface Theme {
  id: string;
  label: string;
  color: string;
}

export interface Language {
  id: string;
  label: string;
  logoPath: string;
  monacoLanguage: string;
  defaultCode: string;
  pistonRuntime: LanguageRuntime;
}

export interface LanguageRuntime {
  language: string;
  version: string;
}

export interface ExecuteCodeResponse {
  compile?: {
    output: string;
  };
  run?: {
    output: string;
    stderr: string;
  };
}

export interface ExecutionResult {
  code: string;
  output: {
    submissionConfirm: boolean;
    detailConfirm: {
      params: string;
      response: string;
      expectedResponse: string;
    }[];
  } | null;
  error: string | null;
}

export interface Runtime {
  language: string;
  version: string;
  aliases: string[];
}

export interface CodeEditorState {
  language: string;
  output: string;
  isRunning: boolean;
  error: string | null;
  theme: string;
  fontSize: number;
  editor: Monaco | null;
  executionResult: ExecutionResult | null;
  runtimes: Runtime[];
  selectedVersion: string | null;
  livePermission: any;

  setEditor: (editor: Monaco) => void;
  getCode: () => string;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  runCode: () => Promise<void>;
  fetchRuntimes: () => Promise<void>;
  setLivePermission: (dt: any) => void;
  setVersion: (version: string) => void;
}

export interface ProblemState {
  language: string;
  output: {
    submissionConfirm: boolean;
    detailConfirm: {
      params: string;
      response: string;
      expectedResponse: string;
    }[];
  } | null;
  isRunning: boolean;
  error: string | null;
  theme: string;
  fontSize: number;
  editor: Monaco | null;
  executionResult: ExecutionResult | null;
  currentTab: "output" | "description";

  // New properties for problem management
  loadingProblem: boolean; // Tracks loading state of problem
  currentProblemId: string | null; // Stores the ID of the current problem
  currentProblem: Problem | null; // Stores the fetched problem's data

  // Methods
  setEditor: (editor: Monaco) => void;
  getCode: () => string;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  runCode: () => Promise<void>;
  loadDefaultProblemCode: () => void;
  getDefaultProblemCode: () => string;

  // New method to fetch problem by ID
  getProblemWithId: (problemData: Problem) => Promise<void>;
}

export interface Snippet {
  _id: Id<"snippets">;
  _creationTime: number;
  userId: string;
  language: string;
  code: string;
  title: string;
  userName: string;
}

export interface Problem {
  _id: Id<"problems">; // Unique identifier for the problem
  _creationTime: number; // Creation timestamp
  title: string; // Problem title
  description: string; // Problem description
  languages: {
    language: string; // Language name
    starterTemplate: string; // Starter template for the language
    expectedOutput: {
      key: string;
      value: string;
    }[]; // Expected output for the problem
  }[]; // Array of language objects
}
