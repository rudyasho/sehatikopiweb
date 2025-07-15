# Sehati Kopi Digital

This is a Next.js application for "Sehati Kopi Digital", a fictional Indonesian coffee house and roastery. The project was built entirely with an AI coding partner in Firebase Studio.

## Core Features

- **Engaging Homepage**: A welcoming landing page showcasing the brand and key offerings.
- **Dynamic Product Catalog**: A complete list of all coffee products available for purchase, with sortable and filterable views, and dedicated detail pages.
- **In-Store Digital Menu**: An elegant, categorized menu for in-store customers.
- **Dynamic Shopping Cart & Checkout**: A full-featured cart to add, update, and remove products. Checkout is handled via WhatsApp integration, followed by a dedicated order confirmation page.
- **Event Schedule**: Listings for coffee cuppings, workshops, and other community events with interactive registration feedback.
- **Informative Blog**: Articles on coffee culture with dedicated pages for each post, featuring recommended articles and products.
- **About & Contact Pages**: Static pages for company information and a functional contact form powered by Resend for email delivery.
- **AI-Powered Features**:
    - **Coffee Recommender**: A Genkit-powered tool to suggest coffee based on user preferences. The recommendation result is seamlessly integrated with the product catalog.
    - **AI Story Teller**: Logged-in users can listen to an AI-generated audio story for blog posts, enhancing the reading experience.
    - **AI Content Generation**: The admin dashboard includes a tool to generate entire blog posts (text and image) from a simple topic prompt.
- **Business Dashboard**: An analytics page for admins showing key business metrics and charts for product popularity, roast, and origin distribution. It also serves as a control panel for adding new products and generating blog content.
- **Centralized Search**: A dedicated search page to find products and blog articles efficiently.
- **User Authentication**: A mock authentication system allowing users to "log in" and view a profile page with mock order history and access privileged features.
- **SEO Optimized**: Includes dynamic metadata, a `sitemap.xml`, and `robots.txt` for optimal search engine ranking.
- **Dark Mode**: A fully implemented dark mode for user preference.

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

### Admin Access

To access the dashboard and other admin features, use the following credentials in the login dialog:
- **Email**: `dev@sidepe.com`
- **Password**: `admin123`
