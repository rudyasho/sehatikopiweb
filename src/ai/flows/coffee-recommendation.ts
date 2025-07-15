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
  caffeineLevel: z.enum(['Low', 'Medium', 'High']).describe('The preferred caffeine level.'),
  timeOfDay: z.enum(['Morning', 'Afternoon', 'Evening']).describe('The typical time of day for drinking coffee.'),
});
export type RecommendCoffeeInput = z.infer<typeof RecommendCoffeeInputSchema>;

const RecommendCoffeeOutputSchema = z.object({
  beanRecommendation: z.string().describe('The recommended coffee bean.'),
  roastLevel: z.string().describe('The recommended roast level.'),
  notes: z.string().describe('Additional notes and considerations, explaining why this coffee is a good match.'),
});
export type RecommendCoffeeOutput = z.infer<typeof RecommendCoffeeOutputSchema>;

export async function recommendCoffee(input: RecommendCoffeeInput): Promise<RecommendCoffeeOutput> {
  return recommendCoffeeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendCoffeePrompt',
  input: {schema: RecommendCoffeeInputSchema},
  output: {schema: RecommendCoffeeOutputSchema},
  prompt: `You are an expert coffee sommelier for an Indonesian coffee brand called "Sehati Kopi". A customer has provided their preferences. Based on this, recommend a specific Indonesian coffee bean (like 'Aceh Gayo', 'Bali Kintamani', etc.) and a roast level. Provide a compelling reason for your choice in the notes.

Customer Preferences:
*   Flavour: {{{flavorPreferences}}}
*   Brewing Method: {{{brewingMethod}}}
*   Preferred Caffeine Level: {{{caffeineLevel}}}
*   Time of Day: {{{timeOfDay}}}

Consider the following when making your recommendation:
*   Match the flavor profile to the user's description.
*   Suggest a suitable roast level for the chosen bean and brewing method.
*   If the user drinks coffee in the 'Evening', you should strongly lean towards a low-caffeine option or decaf if possible.
*   Your notes should be encouraging and explain *why* the recommendation fits their complete profile.

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
