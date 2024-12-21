import React from "react";
import { create } from "zustand";

type Tab = "output" | "ai" | "question" | "live";
type TabRefs = {
  [key in Tab]: React.MutableRefObject<HTMLDivElement | null>;
};

type TabStore = {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  tabRefs: TabRefs;
};

export const useTabsStore = create<TabStore>((set) => ({
  currentTab: "output",
  setCurrentTab: (tab) => set({ currentTab: tab }),
  tabRefs: {
    output: React.createRef(),
    ai: React.createRef(),
    question: React.createRef(),
    live: React.createRef(),
  },
}));
