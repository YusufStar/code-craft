"use client";
import { Problem } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

import { motion } from "framer-motion";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

function ProblemCard({ problem }: { problem: Problem }) {
  const { user } = useUser();
  // const deleteProblem = useMutation(api.problems.deleteProblem);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      console.log("deleted problem");
      // await deleteProblem({ problemId: problem._id });
    } catch (error) {
      console.log("Error deleting problem:", error);
      toast.error("Error deleting problem");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      className="group relative"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/problems/${problem._id}`} className="h-full block">
        <div
          className="relative h-full bg-[#1e1e2e]/80 backdrop-blur-sm rounded-xl 
          border border-[#313244]/50 hover:border-[#313244] 
          transition-all duration-300 overflow-hidden"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-row items-center gap-3">
                {problem.languages.map(({ language }) => {
                  return (
                    <div key={language} className="relative">
                      <div
                        className="absolute gap-2 inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 
                    group-hover:opacity-30 transition-all duration-500"
                        area-hidden="true"
                      />
                      <div
                        className="relative p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20
                     group-hover:to-purple-500/20 transition-all duration-500"
                      >
                        <Image
                          src={`/${language}.png`}
                          alt={`${language} logo`}
                          className="w-6 h-6 object-contain relative z-10"
                          width={24}
                          height={24}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="absolute top-5 right-5 z-10 flex gap-4 items-center"
                onClick={(e) => e.preventDefault()}
              >
                {
                  // TODO: Only Admin Delete Problems.
                  user?.id === problem._id && (
                    <div className="z-10" onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200
                                  ${
                                    isDeleting
                                      ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                                      : "bg-gray-500/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                                  }
                                `}
                      >
                        {isDeleting ? (
                          <div className="size-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  )
                }
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {problem.title}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
export default ProblemCard;
