"use client";
import { useWebStore } from "@/store/useWebStore";
import { FileState } from "@/types";
import { FileIcon, FolderIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

const languages = [
  {
    language: "javascript",
    icon: "/javascript.png",
    extension: ".js",
  },
  {
    language: "typescript",
    icon: "/typescript.png",
    extension: ".ts",
  },
  {
    language: "python",
    icon: "/python.png",
    extension: ".py",
  },
  {
    language: "java",
    icon: "/java.png",
    extension: ".java",
  },
  {
    language: "svg",
    icon: "/svg.png",
    extension: ".svg",
  },
  {
    language: "gitignore",
    icon: "/gitignore.png",
    extension: ".gitignore",
  },
  {
    language: "json",
    icon: "/json.png",
    extension: ".json",
  },
  {
    language: "md",
    icon: "/md.png",
    extension: ".md",
  },
  {
    language: "css",
    icon: "/css.png",
    extension: ".css",
  },
];

const FilesPanel = () => {
  const [formState, setFormState] = useState({
    fileName: "",
    extension: "",
    folderName: "",
  });
  const [openFile, setOpenFile] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);

  const fileRef = React.useRef<HTMLDivElement | null>(null);
  const folderRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  const { files, setFiles, selectedId, setSelectId, setId } = useWebStore();

  const handleOpenFile = () => {
    setFormState({
      extension: "",
      fileName: "",
      folderName: "",
    });
    setOpenFile(true);
    setOpenFolder(false);
  };

  const handleOpenFolder = () => {
    setFormState({
      extension: "",
      fileName: "",
      folderName: "",
    });
    setOpenFolder(true);
    setOpenFile(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        fileRef.current &&
        !fileRef.current.contains(e.target as Node) &&
        folderRef.current &&
        !folderRef.current.contains(e.target as Node)
      ) {
        setOpenFile(false);
        setOpenFolder(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_IP}/api/create-default-project`
      );
      if (!data.projectFiles) return;
      setFiles(data.projectFiles);
      setId(data.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start justify-start h-full space-y-4">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-[#1e1e2e] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {files.length > 0 ? (
            <>
              <div className="flex items-center justify-between w-full relative">
                <h2 className="text-lg font-medium text-white">Files</h2>
                <div className="flex items-center gap-3">
                  <button
                    disabled={openFile}
                    onClick={handleOpenFile}
                    className="flex items-center gap-2 px-3 py-1 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5 hover:bg-[#2e2e2e]/50 transition-all duration-200"
                  >
                    <FileIcon className="size-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">
                      Add File
                    </span>
                  </button>
                  <button
                    disabled={openFolder}
                    onClick={handleOpenFolder}
                    className="flex items-center gap-2 px-3 py-1 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5 hover:bg-[#2e2e2e]/50 transition-all duration-200"
                  >
                    <FolderIcon className="size-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">
                      Add Folder
                    </span>
                  </button>
                </div>

                {/*
            <AnimatePresence mode="wait">
              {openFile && (
                <motion.div
                  ref={fileRef}
                  key={"openFile"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-10 right-0 bg-[#1e1e2e] rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center gap-3">
                    <input
                      value={formState.fileName}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          fileName: e.target.value,
                        }))
                      }
                      type="text"
                      placeholder="File Name"
                      className="w-full px-2 py-1 bg-[#1e1e2e] text-white border border-white/10 rounded-lg"
                    />
                    <select
                      value={formState.extension}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          extension: e.target.value,
                        }))
                      }
                      className="px-2 py-1 bg-[#1e1e2e] text-white border border-white/10 rounded-lg"
                    >
                      {languages.map((lang) => (
                        <option
                          key={lang.language}
                          value={lang.extension}
                          className="flex items-center"
                        >
                          {lang.language} ({lang.extension})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddFile}
                      className="px-3 py-1 bg-blue-400 rounded-lg text-white"
                    >
                      Add
                    </button>
                    <button
                      onClick={handleCloseFile}
                      className="px-3 py-1 bg-red-400 rounded-lg text-white"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}

              {openFolder && (
                <motion.div
                  ref={folderRef}
                  key={"openFolder"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-10 right-0 bg-[#1e1e2e] rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center gap-3">
                    <input
                      value={formState.folderName}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          folderName: e.target.value,
                        }))
                      }
                      type="text"
                      placeholder="Folder Name"
                      className="w-full px-2 py-1 bg-[#1e1e2e] text-white border border-white/10 rounded-lg"
                    />
                    <button
                      onClick={handleAddFolder}
                      className="px-3 py-1 bg-blue-400 rounded-lg text-white"
                    >
                      Add
                    </button>
                    <button
                      onClick={handleCloseFolder}
                      className="px-3 py-1 bg-red-400 rounded-lg text-white"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
           */}
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-gray-700" />

              {/* Files */}
              <FileTree
                setSelectId={setSelectId}
                selectedId={selectedId}
                files={files.sort((a, b) => {
                  if (a.isFolder && !b.isFolder) return -1;
                  if (!a.isFolder && b.isFolder) return 1;
                  if (a.isFolder && b.isFolder) {
                    return a.name.localeCompare(b.name);
                  } else {
                    return a.name.localeCompare(b.name);
                  }
                })}
              />
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full flex-col gap-2">
              <h2 className="text-lg font-medium text-white">No Files Found</h2>
              {/* Create React Project Button */}
              <button
                onClick={() => handleCreateProject()}
                className="px-3 py-1 bg-blue-400 hover:bg-blue-500 transition-all duration-200 ease-in-out rounded-lg text-white"
              >
                Create Project
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Folder = ({
  folder,
  selectedId,
  setSelectId,
}: {
  folder: FileState;
  selectedId: string;
  setSelectId: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!folder._id) return;
    setSelectId(folder._id);
  };

  return (
    <div>
      {/* Folder Header */}
      <div
        className={`flex items-center gap-3 my-1 cursor-pointer ${
          selectedId === folder._id ? "text-blue-400" : "text-white"
        }`}
        onClick={() => toggleOpen()}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
          <FolderIcon className="size-4 text-gray-400" />
        </div>
        <h2 className="text-sm font-medium">{folder.name}</h2>
      </div>

      {/* Folder Contents */}
      {folder.children && isOpen && folder?.children.length > 0 && (
        <div className="ml-6">
          <FileTree
            setSelectId={setSelectId}
            selectedId={selectedId}
            files={folder.children}
          />
        </div>
      )}
    </div>
  );
};

const File = ({
  file,
  selectedId,
  setSelectId,
}: {
  file: FileState;
  selectedId: string;
  setSelectId: (id: string) => void;
}) => {
  const language =
    file.name === ".gitignore"
      ? "gitignore"
      : languages.find((lang) => lang.extension === file.extension)?.language;

  return (
    <div
      onClick={() => {
        if (!file._id) return;
        setSelectId(file._id);
      }}
      className="flex items-center gap-3 ml-6 cursor-pointer"
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
        <Image
          src={`/${language}.png`}
          alt={`${language} logo`}
          className="w-4 h-4 object-contain relative z-10"
          width={16}
          height={16}
        />
      </div>
      <h2
        className={`text-sm font-medium ${selectedId === file._id ? "text-blue-400" : "text-white"}`}
      >
        {file.name}
      </h2>
    </div>
  );
};

const FileTree = ({
  files,
  selectedId,
  setSelectId,
}: {
  files: FileState[];
  selectedId: string;
  setSelectId: (id: string) => void;
}) => {
  const renderFiles = (files: FileState[]) => {
    return files.map((file, index) => {
      const key = file._id || `${file.name}-${index}`; // Benzersiz bir key oluştur

      if (!file.isFolder) {
        return (
          <File
            setSelectId={setSelectId}
            selectedId={selectedId}
            key={key}
            file={file}
          />
        );
      } else {
        return (
          <Folder
            setSelectId={setSelectId}
            selectedId={selectedId}
            key={key}
            folder={file}
          />
        );
      }
    });
  };

  return <div className="flex flex-col space-y-2">{renderFiles(files)}</div>;
};

export default FilesPanel;
