import { create } from "zustand";
import { Socket } from "socket.io-client";

// Define the types for room data and permissions
interface RoomData {
  code: string;
  language: string;
  output: string;
}

interface SocketStore {
  socket: Socket | null; // The socket instance
  roomData: RoomData | null; // The room data
  isConnected: boolean; // Connection status

  createRoom: ({
    creatorId,
    name,
    password,
  }: {
    creatorId: string;
    name: string;
    password?: string;
  }) => void; // Create a room
  setSocket: (socket: Socket) => void; // Set socket instance
  joinRoom: (roomId: string) => void; // Join a room
  updateCode: (roomId: string, code: string, userId: string) => void; // Update code
  updatePermissions: (
    roomId: string,
    userId: string,
    permissions: any[]
  ) => void; // Update permissions
  setConnectionStatus: (status: boolean) => void; // Set connection status
}

// Create the Zustand store with proper types
const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  roomData: null,
  isConnected: false,

  // Set socket instance
  setSocket: (socket: Socket) => set({ socket }),

  // Create a room
  createRoom: ({
    creatorId,
    name,
    password,
  }: {
    creatorId: string;
    name: string;
    password?: string;
  }) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("create-room", { creatorId, name, password });
    }
  },

  // Join a room and listen for room updates
  joinRoom: (roomId: string) => {
    const socket = get().socket;
    if (socket) {
      console.log("joining socket room", roomId);
      socket.emit("join-room", { roomId });
    }
  },

  // Update code in the current room
  updateCode: (roomId: string, code: string, userId: string) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("update-code", { roomId, code, userId });
    }
  },

  // Update permissions for a user in the room
  updatePermissions: (
    roomId: string,
    userId: string,
    permissions: any[]
  ) => {
    const socket = get().socket;
    if (socket) {
      socket.emit("update-permissions", { roomId, userId, permissions });
    }
  },

  // Set the connection status
  setConnectionStatus: (status: boolean) => set({ isConnected: status }),
}));

export default useSocketStore;
