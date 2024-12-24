import { create } from "zustand";
import { FileState, WebState } from "@/types";

const getInitialState = () => {
  if (typeof window === "undefined") {
    console.log("Running on server");
    return {
      fontSize: 14,
      theme: "vs-dark",
    };
  }

  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-fontSize") || 14;

  return {
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useWebStore = create<WebState>((set, get, store) => {
  const initialState = getInitialState();

  const updateChildren = (
    items: FileState[],
    id: string,
    updater: (children: FileState[]) => FileState[]
  ): FileState[] => {
    return items.map((item) => {
      if (item._id === id && item.isFolder) {
        return { ...item, children: updater(item.children || []) };
      }
      if (item.isFolder) {
        return {
          ...item,
          children: updateChildren(item.children || [], id, updater),
        };
      }
      return item;
    });
  };

  return {
    ...initialState,
    language: "javascript",
    theme: "vs-dark",
    fontSize: 14,
    editor: null,
    currentTab: "files",
    files: [],
    selectedId: "",
    id: "",

    setId: (id: string) => {
      set({ id });
    },
    setFiles: (files: FileState[]) => {
      set({ files });
    },

    setSelectId: (id: string) => {
      set({ selectedId: id === get().selectedId ? "" : id });
    },

    addFile: (file: FileState) => {
      const { selectedId, files } = get();
      if (!selectedId) {
        console.error("No folder selected");
        return;
      }
      set({
        files: updateChildren(files, selectedId, (children) => [
          ...children,
          file,
        ]),
      });
    },

    removeFile: (fileId: string) => {
      const removeFileRecursive = (folders: FileState[]): FileState[] => {
        return folders
          .map((folder) => {
            if (folder.isFolder) {
              return {
                ...folder,
                children: removeFileRecursive(folder.children || []),
              };
            }
            return folder;
          })
          .filter((file) => file._id !== fileId);
      };
      set({ files: removeFileRecursive(get().files) });
    },

    updateFile: (fileId: string, updatedFile: Partial<FileState>) => {
      const updateFileRecursive = (folders: FileState[]): FileState[] => {
        return folders.map((file) => {
          if (file._id === fileId) {
            return { ...file, ...updatedFile };
          }
          if (file.isFolder) {
            return {
              ...file,
              children: updateFileRecursive(file.children || []),
            };
          }
          return file;
        });
      };
      set({ files: updateFileRecursive(get().files) });
    },

    addFolder: (folder: FileState) => {
      const { selectedId, files } = get();
      if (!selectedId) {
        console.error("No folder selected");
        return;
      }
      set({
        files: updateChildren(files, selectedId, (children) => [
          ...children,
          folder,
        ]),
      });
    },

    removeFolder: (folderId: string) => {
      const removeFolderRecursive = (folders: FileState[]): FileState[] => {
        return folders
          .map((folder) => {
            if (folder.isFolder) {
              return {
                ...folder,
                children: removeFolderRecursive(folder.children || []),
              };
            }
            return folder;
          })
          .filter((folder) => folder._id !== folderId);
      };
      set({ files: removeFolderRecursive(get().files) });
    },

    updateFolder: (folderId: string, updatedFolder: Partial<FileState>) => {
      const updateFolderRecursive = (folders: FileState[]): FileState[] => {
        return folders.map((folder) => {
          if (folder._id === folderId) {
            return { ...folder, ...updatedFolder };
          }
          if (folder.isFolder) {
            return {
              ...folder,
              children: updateFolderRecursive(folder.children || []),
            };
          }
          return folder;
        });
      };
      set({ files: updateFolderRecursive(get().files) });
    },

    addFileRecursive: (file: FileState, parentId: string) => {
      const { files } = get();
      set({
        files: updateChildren(files, parentId, (children) => [
          ...children,
          file,
        ]),
      });
    },

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor) => {
      if (!editor) {
        console.error("Monaco editor is not initialized");
        return;
      }
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-fontSize", fontSize.toString());
      set({ fontSize });
    },

    createRootFolder: () => {
      const rootFolder: FileState = {
        _id: "root",
        name: "Root",
        isFolder: true,
        children: [],
      };
      set({ files: [rootFolder], selectedId: "root" });
    },

    setLanguage: (language: string) => {
      localStorage.setItem("editor-language", language);
      set({ language });
    },
  };
});

export function getSelectedFile() {
  const { files, selectedId } = useWebStore.getState();

  function findFile(items: FileState[]): FileState | null {
    for (const item of items) {
      if (item._id === selectedId) {
        return item;
      }
      if (item.isFolder && item.children) {
        const found = findFile(item.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  return findFile(files);
}
