import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // clerkId
    email: v.string(),
    name: v.string(),
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(), // store user's name for easy access
  }).index("by_user_id", ["userId"]),

  snippetComments: defineTable({
    snippetId: v.id("snippets"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(), // This will store HTML content
  }).index("by_snippet_id", ["snippetId"]),

  stars: defineTable({
    userId: v.string(),
    snippetId: v.id("snippets"),
  })
    .index("by_user_id", ["userId"])
    .index("by_snippet_id", ["snippetId"])
    .index("by_user_id_and_snippet_id", ["userId", "snippetId"]),

  problems: defineTable({
    title: v.string(), // Problem title
    description: v.string(), // Problem description
    languages: v.array(
      v.object({
        language: v.string(), // Language name
        starterTemplate: v.string(), // Starter template for the language
        expectedOutput: v.array(
          v.object({
            key: v.string(),
            value: v.string(),
          })
        ),
      })
    ),
  }).index("by_title", ["title"]),

  solves: defineTable({
    problemId: v.id("problems"), // Reference to the problem
    userId: v.string(), // User who solved the problem
    code: v.string(), // User's solution code
    output: v.optional(v.string()), // Output of the code
    isSuccessful: v.boolean(), // Whether the solution was successful
    language: v.string(), // Language used in the solution
  })
    .index("by_problem_id", ["problemId"])
    .index("by_user_id", ["userId"]),
});
