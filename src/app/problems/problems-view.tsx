"use client";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import NavigationHeader from "@/components/NavigationHeader";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Code, Grid, Search, Tag, X } from "lucide-react";
import ProblemsPageSkeleton from "./_components/ProblemsPageSkeleton";
import dynamic from "next/dynamic";
import { debounce } from "lodash";

// Dynamically import ProblemCard to reduce the initial bundle size
const ProblemCard = dynamic(() => import("./_components/ProblemCard"), {
  ssr: false,
});

function ProblemsPage() {
  const problems = useQuery(api.problems.getProblems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Memoizing the languages list and filtering logic to avoid unnecessary re-renders
  const languages = useMemo(() => {
    return Array.from(
      new Set(problems?.flatMap((s) => s.languages.map((lang) => lang.language)) || [])
    );
  }, [problems]);

  const popularLanguages = languages.slice(0, 5);

  // Debounced filter function to avoid filtering on every keystroke
  const handleSearchChange = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  const filteredProblems = useMemo(() => {
    return problems?.filter((snippet) => {
      const matchesSearch =
        snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage =
        !selectedLanguage ||
        snippet.languages.some((lang) => lang.language === selectedLanguage);

      return matchesSearch && matchesLanguage;
    }) || [];
  }, [problems, searchQuery, selectedLanguage]);

  // loading state
  if (problems === undefined) {
    return (
      <div className="min-h-screen">
        <NavigationHeader />
        <ProblemsPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-sm text-gray-400 mb-6"
          >
            <BookOpen className="w-4 h-4" />
            Community Code Library
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-6"
          >
            Discover & Solve Problems
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 mb-8"
          >
            Explore carefully crafted problems
          </motion.p>
        </div>

        {/* Filters Section */}
        <div className="relative max-w-5xl mx-auto mb-12 space-y-6">
          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search problems by title, language"
                className="w-full pl-12 pr-4 py-4 bg-[#1e1e2e]/80 hover:bg-[#1e1e2e] text-white
                  rounded-xl border border-[#313244] hover:border-[#414155] transition-all duration-200
                  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Languages:</span>
            </div>

            {popularLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() =>
                  setSelectedLanguage(lang === selectedLanguage ? null : lang)
                }
                className={`
                    group relative px-3 py-1.5 rounded-lg transition-all duration-200
                    ${
                      selectedLanguage === lang
                        ? "text-blue-400 bg-blue-500/10 ring-2 ring-blue-500/50"
                        : "text-gray-400 hover:text-gray-300 bg-[#1e1e2e] hover:bg-[#262637] ring-1 ring-gray-800"
                    }
                  `}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={`/${lang}.png`}
                    alt={lang}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-sm">{lang}</span>
                </div>
              </button>
            ))}

            {selectedLanguage && (
              <button
                onClick={() => setSelectedLanguage(null)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {filteredProblems.length} problem found
              </span>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-[#1e1e2e] rounded-lg ring-1 ring-gray-800">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md transition-all ${view === "grid" ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-gray-300 hover:bg-[#262637]"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* problems Grid */}
        <motion.div
          className={`grid gap-6 ${view === "grid" ? "grid-cols-1 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 max-w-3xl mx-auto"}`}
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredProblems.map((problem) => (
              <ProblemCard key={problem._id} problem={problem} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* edge case: empty state */}
        {filteredProblems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-md mx-auto mt-20 p-8 rounded-2xl overflow-hidden"
          >
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br
                from-blue-500/10 to-purple-500/10 ring-1 ring-white/10 mb-6"
              >
                <Code className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">
                No problems found
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || selectedLanguage
                  ? "Try adjusting your search query or filters"
                  : "Be the first to share a code problem with the community"}
              </p>

              {(searchQuery || selectedLanguage) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLanguage(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#262637] text-gray-300 hover:text-white rounded-lg
                    transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ProblemsPage;
