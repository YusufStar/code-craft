import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createRoom = mutation({
  args: {
    name: v.string(),
    isPrivate: v.boolean(),
    createdUserId: v.id("users"),
    password: v.optional(v.string()),
    participants: v.array(v.id("users")),
  },

  async handler({ db }, args) {
    const roomCode = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);

    const room = await db.insert("rooms", {
      name: args.name,
      isPrivate: args.isPrivate,
      createdUserId: args.createdUserId,
      password: args.password,
      participants: args.participants,
      roomCode: roomCode,
    });

    const roomData = await db
      .query("rooms")
      .withIndex("by_room_code")
      .filter((q) => q.eq(q.field("_id"), roomCode))
      .first();

    if (!roomData) {
      throw new Error("Room not found");
    }

    await db.insert("roomEditors", {
      roomId: roomData._id,
      code: "",
      language: "javascript",
      version: "18.15.0",
      output: "",
    });

    return room;
  },
});

export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    userId: v.id("users"),
  },

  async handler({ db }, args) {
    const room = await db
      .query("rooms")
      .withIndex("by_room_code")
      .filter((q) => q.eq(q.field("_id"), args.roomCode))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.participants.includes(args.userId)) {
      throw new Error("User already in room");
    }

    room.participants.push(args.userId);

    await db.patch(room._id, room);

    return room;
  },
});

export const leaveRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },

  async handler({ db }, args) {
    const room = await db
      .query("rooms")
      .withIndex("by_id")
      .filter((q) => q.eq(q.field("_id"), args.roomId))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    if (!room.participants.includes(args.userId)) {
      throw new Error("User not in room");
    }

    room.participants = room.participants.filter((id) => id !== args.userId);

    if (room.participants.length === 0) {
      await db.delete(room._id);

      return null;
    } else {
      await db.patch(room._id, room);

      return room;
    }
  },
});

export const updateEditor = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
    code: v.optional(v.string()),
    language: v.optional(v.string()),
    output: v.optional(v.string()),
    version: v.optional(v.string()),
  },

  async handler({ db }, args) {
    const room = await db
      .query("rooms")
      .withIndex("by_id")
      .filter((q) => q.eq(q.field("_id"), args.roomId))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    if (!room.participants.includes(args.userId)) {
      throw new Error("User not in room");
    }

    const roomEditor = await db
      .query("roomEditors")
      .withIndex("by_room_id")
      .filter((q) => {
        return q.and(q.eq(q.field("roomId"), args.roomId));
      })
      .first();

    if (!roomEditor) {
      throw new Error("Room editor not found");
    }

    if (args.code !== undefined) {
      roomEditor.code = args.code;
    }

    if (args.language !== undefined) {
      roomEditor.language = args.language;
    }

    if (args.output !== undefined) {
      roomEditor.output = args.output;
    }

    if (args.version !== undefined) {
      roomEditor.version = args.version;
    }

    await db.patch(roomEditor._id, roomEditor);
  },
});
