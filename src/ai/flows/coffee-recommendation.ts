// src/ai/flows/coffee-recommendation.ts
'use server';
/**
 * @fileOverview A coffee recommendation AI agent.
 *
 * - recommendCoffee - A function that handles the coffee recommendation process.
 * - RecommendCoffeeInput - The input type for the recommendCoffee function.
 * - RecommendCoffeeOutput - The return type for the recommendCoffee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendCoffeeInputSchema = z.object({
  flavorPreferences: z
    .string()
    .describe(
      'A description of the customers flavour preferences, including sweet, bitter, acidic, etc.'
    ),
  brewingMethod: z.string().describe('The customers preferred brewing method.'),
});
export type RecommendCoffeeInput = z.infer<typeof RecommendCoffeeInputSchema>;

const RecommendCoffeeOutputSchema = z.object({
  beanRecommendation: z.string().describe('The recommended coffee bean.'),
  roastLevel: z.string().describe('The recommended roast level.'),
  notes: z.string().describe('Additional notes and considerations.'),
});
export type RecommendCoffeeOutput = z.infer<typeof RecommendCoffeeOutputSchema>;

export async function recommendCoffee(input: RecommendCoffeeInput): Promise<RecommendCoffeeOutput> {
  return recommendCoffeeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendCoffeePrompt',
  input: {schema: RecommendCoffeeInputSchema},
  output: {schema: RecommendCoffeeOutputSchema},
  prompt: `You are an expert coffee sommelier. A customer has provided their flavour preferences and brewing method. Based on this, recommend a coffee bean and roast level.

Flavour Preferences: {{{flavorPreferences}}}
Brewing Method: {{{brewingMethod}}}

Consider the following when making your recommendation:

*   Origin
*   Acidity
*   Body
*   Sweetness
*   Bitterness

Return the results as JSON.`,
});

const recommendCoffeeFlow = ai.defineFlow(
  {
    name: 'recommendCoffeeFlow',
    inputSchema: RecommendCoffeeInputSchema,
    outputSchema: RecommendCoffeeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
