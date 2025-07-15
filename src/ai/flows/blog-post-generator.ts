
'use server';
/**
 * @fileOverview An AI flow for generating blog post content, including an image.
 *
 * - generateBlogPost - A function that takes a topic and returns a blog post draft.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateImage } from './image-generator';

const GenerateBlogPostOutputSchema = z.object({
  title: z.string().describe('A catchy and SEO-friendly title for the blog post.'),
  category: z.enum(['Brewing Tips', 'Storytelling', 'Coffee Education', 'News']).describe('The most appropriate category for the blog post.'),
  content: z.string().describe('The full content of the blog post, formatted as a single string of HTML. Use <p>, <h3>, <ul>, <ol>, and <li> tags. Do not include a main <h1> title, as that is handled by the `title` field.'),
  imageDataUri: z.string().describe("A data URI for the generated blog post image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;


export async function generateBlogPost(topic: string): Promise<GenerateBlogPostOutput> {
  return blogPostGeneratorFlow(topic);
}

const prompt = ai.definePrompt({
  name: 'blogPostGeneratorPrompt',
  input: {schema: z.string()},
  output: {schema: GenerateBlogPostOutputSchema.omit({ imageDataUri: true })},
  prompt: `You are an expert content writer and coffee enthusiast for an Indonesian coffee brand called "Sehati Kopi". Your task is to write an engaging and informative blog post based on the provided topic.

The brand voice is passionate, knowledgeable, and celebratory of Indonesian coffee heritage.

Topic: {{{input}}}

Instructions:
1.  Generate a compelling title for the post.
2.  Choose the best category from the available options.
3.  Write the body of the blog post, at least 3-4 paragraphs long.
4.  Structure the content using HTML tags. Use <p> for paragraphs, <h3> for subheadings, and <ul>/<ol> for lists where appropriate.
5.  Ensure the output is a single, valid JSON object matching the defined schema. The 'content' field must be a single string containing all the HTML.`,
});

const blogPostGeneratorFlow = ai.defineFlow(
  {
    name: 'blogPostGeneratorFlow',
    inputSchema: z.string(),
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async (topic) => {
    // Generate text and image in parallel to speed things up
    const [textResult, imageResult] = await Promise.all([
      prompt(topic),
      generateImage(topic),
    ]);
    
    const { output: textOutput } = textResult;
    if (!textOutput) {
        throw new Error('Failed to generate blog post text.');
    }

    return {
        ...textOutput,
        imageDataUri: imageResult.imageDataUri,
    };
  }
);
