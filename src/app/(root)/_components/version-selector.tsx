"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "lucide-react";
import useMounted from "@/hooks/useMounted";

function VersionSelector({ hasAccess }: { hasAccess: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();

  const { language, runtimes, selectedVersion, setVersion, fetchRuntimes } =
    useCodeEditorStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const versions = runtimes
    .filter((runtime) => runtime.language === language || runtime.aliases.includes(language))
    .map((runtime) => runtime.version);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setVersion(
      (localStorage.getItem(`editor-${language}-version`) as string) ||
        versions[-1]
    );
    fetchRuntimes();
  }, []);

  const handleVersionSelect = (version: string) => {
    setVersion(version);
    setIsOpen(false);
  };

  if (!mounted || !hasAccess) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={versions.length <= 0}
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-3 px-4 py-2.5 bg-[#1e1e2e]/80 
      rounded-lg transition-all 
       duration-200 border border-gray-800/50 hover:border-gray-700 disabled:pointer-events-none disabled:opacity-50 ease-in-out`}
      >
        {/* Decoration */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/5 
        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        />

        <span className="text-gray-200 min-w-[80px] text-left group-hover:text-white transition-colors">
          {selectedVersion || "Select Version"}
        </span>

        <ChevronDownIcon
          className={`size-4 text-gray-400 transition-all duration-300 group-hover:text-gray-300
            ${isOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 bg-[#1e1e2e]/95 backdrop-blur-xl
           rounded-xl border border-[#313244] shadow-2xl py-2 z-50"
          >
            <div className="px-3 pb-2 mb-2 border-b border-gray-800/50">
              <p className="text-xs font-medium text-gray-400">
                Select Version
              </p>
            </div>

            <div className="max-h-[280px] overflow-y-auto overflow-x-hidden">
              {versions.map((version, index) => (
                <motion.div
                  key={version}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group px-2"
                >
                  <button
                    className={`
                      relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${selectedVersion === version ? "bg-blue-500/10 text-blue-400" : "text-gray-300"}
                      hover:bg-[#262637]
                    `}
                    onClick={() => handleVersionSelect(version)}
                  >
                    {/* decorator */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg 
                      opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    <span className="flex-1 text-left group-hover:text-white transition-colors">
                      {version}
                    </span>

                    {/* selected version border */}
                    {selectedVersion === version && (
                      <motion.div
                        className="absolute inset-0 border-2 border-blue-500/30 rounded-lg"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VersionSelector;
