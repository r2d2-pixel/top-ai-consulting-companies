import { defineCollection, z } from 'astro:content';

// Structured company data lives in src/data/companies.yaml.
// MDX frontmatter is intentionally minimal — only SEO overrides.
const companies = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string().optional(), // page <title> override
    description: z.string().optional(), // meta description override
  }),
});

export const collections = { companies };
