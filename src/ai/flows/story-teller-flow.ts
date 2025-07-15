// src/ai/flows/story-teller-flow.ts
'use server';
/**
 * @fileOverview An AI flow for generating an audio story about a coffee.
 *
 * - generateCoffeeStory - A function that takes product details and returns an audio file.
 * - CoffeeStoryInput - The input type for the generateCoffeeStory function.
 * - CoffeeStoryOutput - The return type for the generateCoffeeStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import wav from 'wav';

const CoffeeStoryInputSchema = z.object({
  name: z.string().describe('The name of the coffee bean.'),
  origin: z.string().describe('The origin of the coffee bean.'),
  description: z.string().describe('A short description of the coffee.'),
});
export type CoffeeStoryInput = z.infer<typeof CoffeeStoryInputSchema>;

const CoffeeStoryOutputSchema = z.object({
  storyText: z.string().describe('The generated story in text format.'),
  audioDataUri: z.string().describe("The generated audio story as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type CoffeeStoryOutput = z.infer<typeof CoffeeStoryOutputSchema>;


export async function generateCoffeeStory(input: CoffeeStoryInput): Promise<CoffeeStoryOutput> {
  return storyTellerFlow(input);
}

const textGenerationPrompt = ai.definePrompt({
    name: 'storyTellerTextPrompt',
    input: {schema: CoffeeStoryInputSchema},
    prompt: `You are a wise, elderly Indonesian storyteller. Create a short, enchanting story (around 2-3 paragraphs) about a coffee named "{{name}}" from "{{origin}}".

Use the following description as inspiration: "{{description}}".

Weave in elements of the local culture, landscape, and the magic of coffee. Your tone should be warm, inviting, and full of wonder. The story is for an audio experience, so make it poetic and engaging to listen to.`,
});


const storyTellerFlow = ai.defineFlow(
  {
    name: 'storyTellerFlow',
    inputSchema: CoffeeStoryInputSchema,
    outputSchema: CoffeeStoryOutputSchema,
  },
  async (input) => {
    // 1. Generate the story text
    const {text: storyText} = await ai.generate({
      prompt: await textGenerationPrompt.render({input: input}),
      model: 'googleai/gemini-2.5-flash',
    });
    
    // 2. Convert text to speech
    const {media} = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A warm, friendly voice
                },
            },
        },
        prompt: storyText,
    });

    if (!media) {
      throw new Error('No audio media was generated.');
    }

    // 3. Convert PCM audio to WAV format
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavData = await toWav(audioBuffer);
    
    return {
        storyText: storyText,
        audioDataUri: 'data:audio/wav;base64,' + wavData,
    };
  }
);


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
