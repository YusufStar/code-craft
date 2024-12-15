"use client";
import { create } from "zustand";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

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
  setRoomId: (roomId: string | null) => set({ roomId: roomId }),
}));

export const initializeSocket = () => {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_IP, {
    transports: ["websocket"],
  });

  useSocketStore.getState().setSocket(socket);
};
