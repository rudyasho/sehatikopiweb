
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

const BlogPostTextOutputSchema = z.object({
  title: z.string().describe('A catchy and SEO-friendly title for the blog post.'),
  category: z.enum(['Brewing Tips', 'Storytelling', 'Coffee Education', 'News']).describe('The most appropriate category for the blog post.'),
  content: z.string().describe('The full content of the blog post, formatted as a single string of HTML. Use <p>, <h3>, <ul>, <ol>, and <li> tags. Do not include a main <h1> title, as that is handled by the `title` field.'),
  imagePrompt: z.string().describe("A creative, descriptive prompt for an AI image generator to create a feature image for this blog post. The prompt should be detailed and evocative, suitable for generating a high-quality photograph."),
});

const GenerateBlogPostOutputSchema = z.object({
  title: z.string(),
  category: z.enum(['Brewing Tips', 'Storytelling', 'Coffee Education', 'News']),
  content: z.string(),
  imageDataUri: z.string().describe("A data URI for the generated blog post image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});

export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;


export async function generateBlogPost(topic: string): Promise<GenerateBlogPostOutput> {
  return blogPostGeneratorFlow(topic);
}

const prompt = ai.definePrompt({
  name: 'blogPostGeneratorPrompt',
  input: {schema: z.string()},
  output: {schema: BlogPostTextOutputSchema},
  prompt: `You are an expert content writer and coffee enthusiast for an Indonesian coffee brand called "Sehati Kopi". Your task is to write an engaging and informative blog post based on the provided topic.

The brand voice is passionate, knowledgeable, and celebratory of Indonesian coffee heritage.

Topic: {{{input}}}

Instructions:
1.  Generate a compelling title for the post.
2.  Choose the best category from the available options.
3.  Write the body of the blog post, at least 3-4 paragraphs long.
4.  Structure the content using HTML tags. Use <p> for paragraphs, <h3> for subheadings, and <ul>/<ol> for lists where appropriate.
5.  Based on the topic and content, write a short, descriptive, and artistic prompt to generate a feature image for this blog post.
6.  Ensure the output is a single, valid JSON object matching the defined schema. The 'content' field must be a single string containing all the HTML.`,
});

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
    
    // 1. Generate the text content and the image prompt
    const {output: textOutput} = await prompt(topic);
    if (!textOutput) {
        throw new Error('Failed to generate blog post text.');
    }

    // 2. Generate the image using the prompt from the previous step
    const { imageDataUri } = await generateImage(textOutput.imagePrompt);

    return {
      title: textOutput.title,
      category: textOutput.category,
      content: textOutput.content,
      imageDataUri: imageDataUri,
    };
  }
);
