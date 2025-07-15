import { RecommendationForm } from './recommendation-client-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Coffee Recommender',
  description: 'Not sure which coffee to choose? Use our AI-powered tool to get a personalized coffee recommendation based on your flavor and brewing preferences.',
};

export default function RecommendationPage() {
  return (
    <div className="bg-secondary/50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Find Your Perfect Coffee</h1>
          <p className="mt-2 text-lg text-foreground/80 max-w-2xl mx-auto">
            Tell us your preferences, and our AI-powered coffee sommelier will find the perfect match for you.
          </p>
        </div>
        <RecommendationForm />
      </div>
    </div>
  );
}
