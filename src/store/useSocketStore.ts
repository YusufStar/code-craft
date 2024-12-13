"use client";
import { create } from "zustand";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

// Socket store'ı tanımlıyoruz
type SocketStore = {
  socket: Socket | null;
  roomId: string | null;
  setSocket: (socket: Socket) => void;
  disconnectSocket: () => void;
  setRoomId: (roomId: string | null) => void;
};

export const useSocketStore = create<SocketStore>((set) => ({
  socket: null,
  roomId: null,
  setSocket: (socket) => set({ socket }),
  disconnectSocket: () => set({ socket: null, roomId: null }),
  setRoomId: (roomId: string) => set({ roomId: roomId }),
}));

// Socket'i başlatan bir fonksiyon
export const initializeSocket = () => {
  const socket = io("http://localhost:3000", {
    transports: ["websocket"],
  });

  useSocketStore.getState().setSocket(socket);
};
