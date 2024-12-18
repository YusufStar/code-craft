import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    await db.insert("rooms", {
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
      .filter((q) => q.eq(q.field("roomCode"), roomCode))
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

    const participantUsers = await db
      .query("users")
      .filter((q) => args.participants.some((id) => q.eq(q.field("_id"), id)))
      .collect();

    // Fetch createdUser details
    const createdUserId = await db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), roomData.createdUserId))
      .first();

    if (!createdUserId) {
      throw new Error("Creator user not found");
    }

    return {
      ...roomData,
      participants: participantUsers.filter(({ _id }) =>
        roomData.participants.includes(_id)
      ), // Replace participant IDs with full user objects
      createdUserId, // Include the full object for the room creator
    };
  },
});

export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    userId: v.id("users"),
    password: v.optional(v.string()),
  },

  async handler({ db }, args) {
    const room = await db
      .query("rooms")
      .withIndex("by_room_code")
      .filter((q) => q.eq(q.field("roomCode"), args.roomCode))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.participants.includes(args.userId)) {
      throw new Error("User already in room");
    }

    if (room.isPrivate && room.password !== args.password) {
      throw new Error("Incorrect password");
    }

    room.participants.push(args.userId);

    await db.patch(room._id, room);

    // Fetch participant user objects
    const participantUsers = await db
      .query("users")
      .filter((q) =>
        room.participants
          .map((id) => id.toString())
          .includes(q.field("_id").toString())
      )
      .collect();

    // Fetch createdUser details
    const createdUser = await db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), room.createdUserId))
      .first();

    if (!createdUser) {
      throw new Error("Creator user not found");
    }

    return {
      ...room,
      participants: participantUsers, // Replace participant IDs with full user objects
      createdUser, // Include the full object for the room creator
    };
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

      // Fetch participant user objects
      const participantUsers = await db
        .query("users")
        .filter((q) => room.participants.some((id) => q.eq(q.field("_id"), id)))
        .collect();

      // Fetch createdUser details
      const createdUser = await db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), room.createdUserId))
        .first();

      if (!createdUser) {
        throw new Error("Creator user not found");
      }

      return {
        ...room,
        participants: participantUsers.filter(({ _id }) =>
          room.participants.includes(_id)
        ), // Replace participant IDs with full user objects
        createdUserId: createdUser, // Include the full object for the room creator
      };
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

    if (args.code === roomEditor.code) {
      return;
    }

    if (args.language === roomEditor.language) {
      return;
    }

    if (args.output === roomEditor.output) {
      return;
    }

    if (args.version === roomEditor.version) {
      return;
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

export const getRoomData = mutation({
  args: {
    roomId: v.id("rooms"),
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

    // Fetch participant user objects
    const participantUsers = await db
      .query("users")
      .filter((q) => room.participants.some((id) => q.eq(q.field("_id"), id)))
      .collect();

    // Fetch createdUser details
    const createdUser = await db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), room.createdUserId))
      .first();

    if (!createdUser) {
      throw new Error("Creator user not found");
    }

    return {
      ...room,
      participants: participantUsers.filter(({ _id }) =>
        room.participants.includes(_id)
      ), // Replace participant IDs with full user objects
      createdUserId: createdUser, // Include the full object for the room creator
    };
  },
});

export const getRoomEditor = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    if (!args.roomId) return null;

    const roomEditor = await ctx.db
      .query("roomEditors")
      .withIndex("by_room_id")
      .filter((q) => q.eq(q.field("_id"), args.roomId))
      .first();
      
    return roomEditor;
  },
});
