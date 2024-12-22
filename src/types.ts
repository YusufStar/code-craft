import { Monaco } from "@monaco-editor/react";
import { Id } from "../convex/_generated/dataModel";

export interface Theme {
  id: string;
  label: string;
  color: string;
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

  setEditor: (editor: Monaco) => void;
  getCode: () => string;
  setLanguage: (language: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  runCode: () => Promise<void>;
  fetchRuntimes: () => Promise<void>;
  setVersion: (version: string) => void;
  setCode: (code: string) => void;
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
  output: string | null;
  error: string | null;
}

export interface ProblemExecutionResult {
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

export interface FileState {
  _id: string;
  name: string;
  isFolder: boolean;
  extension?: string;
  language?: string;
  content?: string;
  // @ts-expect-error: TODO: Fix this
  children?: FileState[];
}

export interface WebState {
  language: string;
  theme: string;
  fontSize: number;
  editor: Monaco | null;
  currentTab: "live" | "files";
  files: FileState[];
  selectedId: string;
  id: string
  
  // Methods
  setId: (id: string) => void;
  setSelectId: (id: string) => void;
  createRootFolder: (name: string) => void;
  addFile: (file: FileState) => void;
  removeFile: (fileName: string) => void;
  updateFile: (fileName: string, updatedFile: Partial<FileState>) => void;
  addFolder: (folder: FileState) => void;
  removeFolder: (folderName: string) => void;
  updateFolder: (folderName: string, updatedFolder: Partial<FileState>) => void;
  setEditor: (editor: Monaco) => void;
  getCode: () => string;
  setLanguage: (language: string) => void;
  setFiles: (files: FileState[]) => void;
  setTheme: (theme: string) => void;
  addFileRecursive: (file: FileState, parentId: string) => void;
  setFontSize: (fontSize: number) => void;
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
  executionResult: ProblemExecutionResult | null;
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
  setCode: (code: string) => void;

  // New method to fetch problem by ID
  getProblemWithId: (problemData: Problem) => Promise<void>;
}

export interface FileState {
  _id: string;
  name: string;
  isFolder: boolean;
  extension?: string;
  language?: string;
  content?: string;
  // @ts-expect-error: TODO: Fix this
  children: FileState[];
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

export type CreatedUser = {
  _id: Id<"users">;
  email: string;
  isPro: boolean;
  name: string;
  proSince: number;
  userId: string;
};

export interface Room {
  id: string;
  name: string;
  permissions: { [key: string]: any };
  code: string;
  language: string;
  output: string;
}

export interface LiveStore {
  room: Room | null;

  setRoom: (room: Room | null) => void;
}
