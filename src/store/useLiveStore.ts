"use client";
import { LiveStore, RoomData } from "@/types";
import { create } from "zustand";

export const useLiveStore = create<LiveStore>((set) => ({
  room: null,
  setRoom: (room: RoomData) =>
    set(() => ({
      room,
    })),
}));
