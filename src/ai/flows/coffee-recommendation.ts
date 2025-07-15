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
import { products } from '@/lib/products-data';

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
  beanRecommendation: z.string().describe('The recommended coffee bean name.'),
  roastLevel: z.string().describe('The recommended roast level.'),
  notes: z.string().describe('Additional notes and considerations, explaining why this coffee is a good match.'),
  productSlug: z.string().describe('The slug of the recommended product from the provided list.'),
});
export type RecommendCoffeeOutput = z.infer<typeof RecommendCoffeeOutputSchema>;

export async function recommendCoffee(input: RecommendCoffeeInput): Promise<RecommendCoffeeOutput> {
  return recommendCoffeeFlow(input);
}

const productContext = products.map(p => ` - Name: ${p.name}, Slug: ${p.slug}, Description: ${p.description}, Roast: ${p.roast}`).join('\n');

const prompt = ai.definePrompt({
  name: 'recommendCoffeePrompt',
  input: {schema: RecommendCoffeeInputSchema},
  output: {schema: RecommendCoffeeOutputSchema},
  prompt: `You are an expert coffee sommelier for an Indonesian coffee brand called "Sehati Kopi". A customer has provided their preferences. Based on this, recommend a specific Indonesian coffee bean from the list provided below and a roast level. Provide a compelling reason for your choice in the notes.

Available Coffees:
${productContext}

Customer Preferences:
*   Flavour: {{{flavorPreferences}}}
*   Brewing Method: {{{brewingMethod}}}
*   Preferred Caffeine Level: {{{caffeineLevel}}}
*   Time of Day: {{{timeOfDay}}}

Your Task:
1.  Analyze the customer's preferences.
2.  Select the *single best match* from the 'Available Coffees' list.
3.  Set the 'beanRecommendation' to the name of the chosen coffee.
4.  Set the 'productSlug' to the slug of the chosen coffee.
5.  Determine the most appropriate 'roastLevel'.
6.  Write encouraging and detailed 'notes' explaining *why* the recommendation fits their complete profile, referencing their preferences.
7.  If the user drinks coffee in the 'Evening', strongly lean towards a low-caffeine option or a coffee that is described as smooth and gentle.

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
