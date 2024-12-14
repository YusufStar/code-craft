import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Problems: Add a new problem
export const addProblem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    expectedOutput: v.string(),
    languages: v.array(
      v.object({
        language: v.string(),
        starterTemplate: v.string(),
      })
    ),
  },
  handler: async (
    { db },
    { title, description, expectedOutput, languages }
  ) => {
    return await db.insert("problems", {
      title,
      description,
      expectedOutput,
      languages,
    });
  },
});

// Problems: Update an existing problem
export const updateProblem = mutation({
  args: {
    problemId: v.id("problems"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      expectedOutput: v.optional(v.string()),
      languages: v.optional(
        v.array(
          v.object({
            language: v.string(),
            starterTemplate: v.string(),
          })
        )
      ),
    }),
  },
  handler: async ({ db }, { problemId, updates }) => {
    return await db.patch(problemId, updates);
  },
});

// Problems: Delete a problem
export const deleteProblem = mutation({
  args: { problemId: v.id("problems") },
  handler: async ({ db }, { problemId }) => {
    return await db.delete(problemId);
  },
});

// Problems: Fetch all problems
export const getProblems = query({
  handler: async ({ db }) => {
    return await db.query("problems").collect();
  },
});

export const getProblem = query({
  args: { problemId: v.id("problems") },
  handler: async ({ db }, { problemId }) => {
    const problem = await db
      .query("problems")
      .withIndex("by_id", (q) => q.eq("_id", problemId))
      .first();

    return problem;
  },
});
