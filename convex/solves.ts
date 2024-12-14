import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Solves: Add a new solve
export const addSolve = mutation({
  args: {
    problemId: v.id("problems"),
    userId: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    isSuccessful: v.boolean(),
    language: v.string(),
  },
  handler: async (
    { db },
    { problemId, userId, code, output, isSuccessful, language }
  ) => {
    return await db.insert("solves", {
      problemId,
      userId,
      code,
      output,
      isSuccessful,
      language,
    });
  },
});

// Solves: Fetch all solves for a problem
export const getSolvesByProblem = query({
  args: { problemId: v.id("problems") },
  handler: async ({ db }, { problemId }) => {
    return await db
      .query("solves")
      .filter((q) => q.eq(q.field("problemId"), problemId))
      .collect();
  },
});
