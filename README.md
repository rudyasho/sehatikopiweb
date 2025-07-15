# Sehati Kopi Digital

This is a Next.js application for "Sehati Kopi Digital", a fictional Indonesian coffee house and roastery. The project is built with Firebase Studio.

## Core Features

- **Engaging Homepage**: A welcoming landing page showcasing the brand and key offerings.
- **Product Catalog**: A complete list of all coffee products available for purchase, with dedicated detail pages.
- **Digital Menu**: An in-store menu for customers, categorized for easy viewing.
- **Dynamic Shopping Cart**: Full-featured cart to add, update, and remove products, with checkout handled via WhatsApp integration and a dedicated order confirmation page.
- **Event Schedule**: Listings for coffee cuppings, workshops, and other community events with interactive registration feedback.
- **Informative Blog**: Articles on coffee culture with dedicated pages for each post.
- **About & Contact Pages**: Static pages for company information and a functional contact form powered by Resend for email delivery.
- **AI Coffee Recommendations**: A Genkit-powered tool to suggest coffee based on user preferences. The recommendation result is seamlessly integrated with the product catalog.
- **Business Dashboard**: An analytics page showing key business metrics and charts for product popularity and roast distribution.
- **Centralized Search**: A dedicated search page to find products and blog articles efficiently.
- **User Authentication**: A mock authentication system allowing users to "log in" and view a profile page with mock order history.
- **SEO Optimized**: Includes dynamic metadata, a sitemap, and `robots.txt` for optimal search engine ranking.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **State Management**: React Context
- **Email Delivery**: [Resend](https://resend.com)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repo
   ```sh
   git clone <your-repo-url>
   ```
2. Create a `.env` file in the root of the project and add your Resend API key:
   ```env
   NEXT_PUBLIC_RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Run the development server
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:9002`.
