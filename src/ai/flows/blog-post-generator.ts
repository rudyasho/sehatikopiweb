
'use server';
/**
 * @fileOverview An AI flow for generating blog post content.
 *
 * - generateBlogPost - A function that takes a topic and returns a blog post draft.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogPostOutputSchema = z.object({
  title: z.string().describe('A catchy and SEO-friendly title for the blog post.'),
  category: z.enum(['Brewing Tips', 'Storytelling', 'Coffee Education', 'News']).describe('The most appropriate category for the blog post based on the topic.'),
  content: z.string().describe('The full content of the blog post, formatted as a single string of Markdown. Use Markdown syntax like ## for headings, * for list items, etc. The content should be at least 3-4 paragraphs long. Do not include a main # title, as that is handled by the `title` field.'),
  imagePrompt: z.string().describe("A creative, descriptive prompt for an AI image generator to create a feature image for this blog post. The prompt should be detailed, artistic, and evocative, suitable for generating a high-quality, professional photograph related to the blog's content."),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;


export async function generateBlogPost(topic: string): Promise<GenerateBlogPostOutput> {
  return blogPostGeneratorFlow(topic);
}

const blogPostGeneratorFlow = ai.defineFlow(
  {
    name: 'blogPostGeneratorFlow',
    inputSchema: z.string(),
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async (topic) => {
    if (typeof topic !== 'string' || !topic) {
      throw new Error('Invalid topic provided for blog post generation.');
    }

    const prompt = ai.definePrompt({
      name: 'blogPostGeneratorPrompt',
      input: {schema: z.string()},
      output: {schema: GenerateBlogPostOutputSchema},
      prompt: `You are an expert content writer and coffee enthusiast for an Indonesian coffee brand called "Sehati Kopi". Your task is to write an engaging and informative blog post based on the provided topic.

The brand voice is passionate, knowledgeable, and celebratory of Indonesian coffee heritage.

Topic: {{{input}}}

Instructions:
1.  Generate a compelling title for the post.
2.  Choose the best category from the available options.
3.  Write the body of the blog post, at least 3-4 paragraphs long.
4.  **Important**: Structure the entire content using **Markdown syntax**. Use '##' for subheadings, '*' for list items, blockquotes, etc. Do not use HTML tags.
5.  Based on the topic and content, write a short, descriptive, and artistic prompt to generate a feature image for this blog post.
6.  Ensure the output is a single, valid JSON object matching the defined schema. The 'content' field must be a single string containing all the Markdown.`,
    });
    
    const {output} = await prompt(topic);
    if (!output) {
        throw new Error('Failed to generate blog post text.');
    }

    return output;
  }
);
