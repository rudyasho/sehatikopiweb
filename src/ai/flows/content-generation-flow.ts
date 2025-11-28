// src/ai/flows/content-generation-flow.ts
'use server';
/**
 * @fileOverview AI flows for generating content like product descriptions and blog ideas.
 *
 * - generateProductDescription - Generates a product description.
 * - generateBlogIdeas - Generates a list of blog post ideas.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';

// ------------------------------------
// Product Description Generation
// ------------------------------------

export const ProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the coffee product.'),
  origin: z.string().describe('The origin of the coffee beans (e.g., Gayo, Kintamani).'),
  tags: z.string().describe('Comma-separated keywords describing the coffee\'s flavor profile (e.g., "Fruity, Aromatic, Clean").'),
});
export type ProductDescriptionInput = z.infer<typeof ProductDescriptionInputSchema>;

export const ProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description, approximately 2-3 sentences long.'),
});
export type ProductDescriptionOutput = z.infer<typeof ProductDescriptionOutputSchema>;

const productDescriptionPrompt = ai.definePrompt({
    name: 'productDescriptionPrompt',
    input: { schema: ProductDescriptionInputSchema },
    output: { schema: ProductDescriptionOutputSchema },
    prompt: `
        You are a professional copywriter for a specialty coffee brand from Indonesia called "Sehati Kopi".
        Your tone is passionate, evocative, and knowledgeable.
        
        Generate a compelling and brief product description (2-3 sentences) for a coffee with the following characteristics:
        
        Product Name: {{{productName}}}
        Origin: {{{origin}}}
        Flavor Profile Keywords: {{{tags}}}
        
        Focus on creating a vivid picture of the coffee's taste and experience.
        Do not just list the keywords; weave them into a narrative.
    `,
});

const productDescriptionFlow = ai.defineFlow(
    {
        name: 'productDescriptionFlow',
        inputSchema: ProductDescriptionInputSchema,
        outputSchema: ProductDescriptionOutputSchema,
    },
    async (input) => {
        const { output } = await productDescriptionPrompt(input);
        return output!;
    }
);

export async function generateProductDescription(input: ProductDescriptionInput): Promise<ProductDescriptionOutput> {
  return productDescriptionFlow(input);
}


// ------------------------------------
// Blog Idea Generation
// ------------------------------------

export const BlogIdeaInputSchema = z.string();
export type BlogIdeaInput = z.infer<typeof BlogIdeaInputSchema>;

export const BlogIdeaOutputSchema = z.object({
  ideas: z.array(z.string()).describe('A list of 5 creative and engaging blog post titles.'),
});
export type BlogIdeaOutput = z.infer<typeof BlogIdeaOutputSchema>;


const blogIdeaPrompt = ai.definePrompt({
    name: 'blogIdeaPrompt',
    input: { schema: BlogIdeaInputSchema },
    output: { schema: BlogIdeaOutputSchema },
    prompt: `
        You are a content strategist for a specialty coffee brand from Indonesia called "Sehati Kopi".
        
        Generate a list of 5 creative and engaging blog post titles based on the following topic:
        
        Topic: {{{input}}}
        
        The titles should be interesting to both coffee novices and enthusiasts.
        Focus on titles that suggest a story, a guide, or a unique insight.
    `,
});

const blogIdeaFlow = ai.defineFlow(
    {
        name: 'blogIdeaFlow',
        inputSchema: BlogIdeaInputSchema,
        outputSchema: BlogIdeaOutputSchema,
    },
    async (topic) => {
        const { output } = await blogIdeaPrompt(topic);
        return output!;
    }
);

export async function generateBlogIdeas(topic: string): Promise<BlogIdeaOutput> {
    return blogIdeaFlow(topic);
}
