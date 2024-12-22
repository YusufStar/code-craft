"use client";
import { Folder, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWebStore } from "@/store/useWebStore";
import FilesPanel from "./FilesPanel";
import axios from "axios";

function OutputPanel() {
  const { currentTab } = useWebStore();
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const [latestOutput, setLatestOutput] = useState("");
  const { files, id } = useWebStore();
  const [loading, setLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const tabRefs = {
    live: useRef<HTMLDivElement | null>(null),
    files: useRef<HTMLDivElement | null>(null),
  };

  useEffect(() => {
    if (tabRefs[currentTab].current) {
      const { offsetWidth, offsetLeft } = tabRefs[currentTab].current;
      setUnderlineStyle({ width: offsetWidth, left: offsetLeft });
    }
  }, [currentTab]);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      handleUpdateLive();
    }, 3000);

    setTimeoutId(newTimeoutId);

    return () => {
      if (newTimeoutId) {
        clearTimeout(newTimeoutId);
      }
    };
  }, [files]);

  const handleUpdateLive = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_IP}/api/build`, {
        files,
        id,
      });

      setLatestOutput(`
        <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>React App</title>
    </head>
    <body>
      <div id="root"></div>
      <script>
        ${data.buildJS}
        </script>
    </body>
  </html>
        `);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full bg-[#181825] rounded-xl p-6 ring-1 ring-gray-800/50">
      {/* Header */}
      <div className="relative flex items-center justify gap-2.5 h-[36px] mb-4">
        {/* Tab buttons */}
        <div
          ref={tabRefs.live}
          onClick={() =>
            useWebStore.setState({
              currentTab: "live",
            })
          }
          className={`group cursor-pointer relative flex items-center gap-2 px-2 py-1 bg-[#1e1e2e]/80 
            rounded-lg transition-all
            hover:opacity-100
            ${currentTab === "live" ? "opacity-100" : "opacity-50"}
             duration-200 border border-gray-800/50 hover:border-gray-700`}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
            <Monitor className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors duration-200">
            Live Preview
          </span>
        </div>

        <div
          ref={tabRefs.files}
          onClick={() =>
            useWebStore.setState({
              currentTab: "files",
            })
          }
          className={`group cursor-pointer relative flex items-center gap-2 px-2 py-1 bg-[#1e1e2e]/80 
            rounded-lg transition-all
            hover:opacity-100
            ${currentTab === "files" ? "opacity-100" : "opacity-50"}
             duration-200 border border-gray-800/50 hover:border-gray-700`}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
            <Folder className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors duration-200">
            Files
          </span>
        </div>

        <div
          className="absolute -bottom-2 rounded-xl left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
          style={{
            width: underlineStyle.width,
            transform: `translateX(${underlineStyle.left}px)`,
          }}
        />
      </div>

      {/* Live Preview Area */}
      <AnimatePresence mode="wait">
        {currentTab === "live" && (
          <motion.div
            key="live"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col max-h-[600px]"
          >
            <div
              className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px]  overflow-auto font-mono text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-t-[#1e1e2e] border-b-[#1e1e2e] rounded-full animate-spin" />
                </div>
              ) : (
                <iframe
                  className="w-full h-full"
                  srcDoc={latestOutput}
                  sandbox="allow-scripts"
                />
              )}
            </div>
          </motion.div>
        )}

        {currentTab === "files" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="files"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col max-h-[600px]"
            >
              <div
                className="relative bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244] 
        rounded-xl p-4 h-[600px]  overflow-auto font-mono text-sm"
              >
                <FilesPanel />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OutputPanel;
