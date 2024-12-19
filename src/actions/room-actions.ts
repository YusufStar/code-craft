// room-actions.ts
import { Room } from "@/types";
import axios from "axios";

// Helper function to create a new room
interface CreateRoomRequest {
  creatorId: string;
  name: string;
  password?: string;
}

export const createRoom = async ({
  creatorId,
  name,
  password,
}: CreateRoomRequest): Promise<Room> => {
  try {
    const { data } = await axios.post("http://localhost:3001/create-room", {
      creatorId,
      name,
      password,
    });

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error creating room");
  }
};

// Helper function to join an existing room
interface JoinRoomRequest {
  roomId: string;
  userId: string;
  password: string;
}

export const joinRoom = async ({
  roomId,
  userId,
  password,
}: JoinRoomRequest): Promise<Room> => {
  try {
    const { data } = await axios.post("http://localhost:3001/join-room", {
      roomId,
      userId,
      password,
    });

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error joining room");
  }
};

// Helper function to leave a room
interface LeaveRoomRequest {
  roomId: string;
  userId: string;
}

export const leaveRoom = async ({
  roomId,
  userId,
}: LeaveRoomRequest): Promise<string> => {
  try {
    const response = await fetch("http://localhost:3001/leave-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId, userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to leave room");
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error(error);
    throw new Error("Error leaving room");
  }
};
