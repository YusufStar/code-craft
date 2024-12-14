import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Problems: Add a new problem
export const addProblem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    languages: v.array(
      v.object({
        language: v.string(),
        starterTemplate: v.string(),
        expectedOutput: v.array(
          v.object({
            key: v.string(), // The input (e.g., parameter passed to the solution function)
            value: v.string(), // The expected output for that input
          })
        ),
      })
    ),
  },
  handler: async ({ db }, { title, description, languages }) => {
    return await db.insert("problems", {
      title,
      description,
      languages,
    });
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
