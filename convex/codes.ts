import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createOrUpdateCode = mutation({
  args: {
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    problemId: v.optional(v.id("problems")),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return {
        error: true,
        message: "Not authenticated",
      };

    // check pro status
    const user = await ctx.db
      .query("users")
      .withIndex("by_id")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .first();

    if (!user?.isPro && args.language !== "javascript") {
      return {
        error: true,
        message: "Pro subscription required to use this language",
      };
    }

    if (args.problemId) {
      const problem = await ctx.db
        .query("problems")
        .withIndex("by_id")
        .filter((q) => q.eq(q.field("_id"), args.problemId))
        .first();

      if (!problem) {
        return {
          error: true,
          message: "Problem not found",
        };
      }

      const checkCode = await ctx.db
        .query("codes")
        .withIndex("by_problem_id_and_language_id_and_user_id")
        .filter(
          (q) =>
            q.eq(q.field("problemId"), args.problemId) &&
            q.eq(q.field("language"), args.language) &&
            q.eq(q.field("userId"), args.userId)
        )
        .first();

      if (checkCode) {
        await ctx.db.patch(checkCode._id, {
          code: args.code,
        });
      } else {
        await ctx.db.insert("codes", {
          userId: args.userId,
          code: args.code,
          language: args.language,
          problemId: args.problemId,
        });
      }
    } else {
      const checkCode = await ctx.db
        .query("codes")
        .withIndex("by_problem_id_and_language_id_and_user_id")
        .filter(
          (q) =>
            q.eq(q.field("problemId"), undefined) &&
            q.eq(q.field("language"), args.language) &&
            q.eq(q.field("userId"), args.userId)
        )
        .first();

      if (checkCode) {
        await ctx.db.patch(checkCode._id, {
          code: args.code,
        });
      } else {
        await ctx.db.insert("codes", {
          userId: args.userId,
          code: args.code,
          language: args.language,
          problemId: undefined,
        });
      }
    }
  },
});

export const getCode = mutation({
  args: {
    userId: v.string(),
    language: v.string(),
  },

  handler: async (ctx, args) => {
    console.log(args);
    const codes = await ctx.db
      .query("codes")
      .withIndex("by_language_and_user_id")
      .filter(
        (q) =>
          q.eq(q.field("language"), args.language) &&
          q.eq(q.field("userId"), args.userId)
      )
      .collect();

    const filtered = codes.filter((c) => c.problemId === undefined);

    if (filtered.length === 0) {
      return {
        code: "",
      };
    }

    return {
      code: filtered[0].code,
    };
  },
});
