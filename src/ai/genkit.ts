// src/ai/genkit.ts
import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Google AI plugin.
// You can specify a model, such as 'gemini-1.5-flash',
// or leave it to default to a sensible default.
//
// The 'temperature' parameter controls the randomness of the model's output.
// A lower temperature (e.g., 0.2) is good for tasks that require more
// deterministic and less creative responses.
const googleAiPlugin = googleAI({
  apiVersion: 'v1beta',
  temperature: 0.2,
});

// Configure Genkit to use the Google AI plugin.
configureGenkit({
  plugins: [googleAiPlugin],
  // Log developer-friendly errors to the console.
  logLevel: 'debug',
  // Use a local file to keep a history of generative AI requests.
  enableTracingAndMetrics: true,
});

// Export the 'ai' object so that other files can use it to define
// and run flows, and to define models and prompts.
export { ai } from 'genkit';
