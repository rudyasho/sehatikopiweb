// src/ai/flows/story-teller-flow.ts
'use server';
/**
 * @fileOverview An AI flow for generating an audio story about a coffee.
 *
 * - generateCoffeeStoryText - Generates only the text for the story.
 * - generateCoffeeStoryAudio - Generates only the audio from provided text.
 * - CoffeeStoryInput - The input type for the story generation functions.
 * - CoffeeStoryTextOutput - The output for the text generation.
 * - CoffeeStoryAudioOutput - The output for the audio generation.
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

const CoffeeStoryTextOutputSchema = z.object({
  storyText: z.string().describe('The generated story in text format.'),
});
export type CoffeeStoryTextOutput = z.infer<typeof CoffeeStoryTextOutputSchema>;

const CoffeeStoryAudioOutputSchema = z.object({
    audioDataUri: z.string().describe("The generated audio story as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type CoffeeStoryAudioOutput = z.infer<typeof CoffeeStoryAudioOutputSchema>;


export async function generateCoffeeStoryText(input: CoffeeStoryInput): Promise<CoffeeStoryTextOutput> {
  return storyTellerTextFlow(input);
}

export async function generateCoffeeStoryAudio(storyText: string): Promise<CoffeeStoryAudioOutput> {
    return storyTellerAudioFlow(storyText);
}

const textGenerationPrompt = ai.definePrompt({
    name: 'storyTellerTextPrompt',
    input: {schema: CoffeeStoryInputSchema},
    output: {schema: z.object({ storyText: z.string() })},
    prompt: `You are a wise, elderly Indonesian storyteller. Create a short, enchanting story (around 2-3 paragraphs) about a coffee named "{{name}}" from "{{origin}}".

Use the following description as inspiration: "{{description}}".

Weave in elements of the local culture, landscape, and the magic of coffee. Your tone should be warm, inviting, and full of wonder. The story is for an audio experience, so make it poetic and engaging to listen to. Return only the story text.`,
});


const storyTellerTextFlow = ai.defineFlow(
  {
    name: 'storyTellerTextFlow',
    inputSchema: CoffeeStoryInputSchema,
    outputSchema: CoffeeStoryTextOutputSchema,
  },
  async (input) => {
    const {output} = await textGenerationPrompt(input);
    if (!output?.storyText) {
        throw new Error('Failed to generate story text.');
    }
    return output;
  }
);

const storyTellerAudioFlow = ai.defineFlow(
    {
        name: 'storyTellerAudioFlow',
        inputSchema: z.string(),
        outputSchema: CoffeeStoryAudioOutputSchema,
    },
    async (storyText) => {
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

        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );
        
        const wavData = await toWav(audioBuffer);
        
        return {
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
