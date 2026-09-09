import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    group: z.enum(["Getting started", "Integrations"]),
    order: z.number().int().nonnegative(),
    status: z.literal("coming-soon"),
  }),
});

export const collections = { docs };
