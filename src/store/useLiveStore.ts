"use client";
import { LiveStore, Room } from "@/types";
import { create } from "zustand";

export const useLiveStore = create<LiveStore>((set) => ({
  room: null,
  setRoom: (room: Room | null) => {
    set(() => ({
      room,
    }));
  },
}));

export const myPermissions = (userId: string): Room["permissions"] => {
  return useLiveStore.getState().room?.permissions[userId]
}