
# Sehati Kopi Digital

This is a Next.js application for "Sehati Kopi Digital", a fictional Indonesian coffee house and roastery. The project was built entirely with an AI coding partner in Firebase Studio.

## Core Features

- **Engaging Homepage**: A welcoming landing page showcasing the brand and key offerings, with its title, subtitle, and image fully manageable from the admin dashboard.
- **Dynamic Product Catalog**: A complete list of all coffee products available for purchase, with sortable and filterable views, and dedicated detail pages.
- **In-Store Digital Menu**: An elegant, categorized menu for in-store customers.
- **Dynamic Shopping Cart & Checkout**: A full-featured cart to add, update, and remove products. Checkout is handled via WhatsApp integration, followed by a dedicated order confirmation page.
- **Event Schedule**: Listings for coffee cuppings, workshops, and other community events with interactive registration feedback.
- **Informative Blog**: Articles on coffee culture with dedicated pages for each post, featuring recommended articles and products, and social sharing functionality.
- **About & Contact Pages**: Static pages for company information and a functional contact form powered by Resend for email delivery.
- **Business Dashboard**: A comprehensive admin panel with multiple functions:
    - **Analytics**: An overview page showing key business metrics and charts for product popularity, roast, and origin distribution.
    - **Product, Blog & Event Management**: Full CRUD (Create, Read, Update, Delete) interfaces for managing content.
    - **User Management**: A view for admins to see all registered users, disable/enable their accounts, or delete them.
    - **Website & Hero Settings**: Panels to dynamically update sitewide information without code changes.
- **Centralized Search**: A dedicated search page to find products and blog articles efficiently.
- **User Authentication**: A complete authentication system using Firebase (Email/Password & Google) allowing users to sign up, log in, and view a profile page with their real order history saved in Firestore. Admin roles grant access to protected features.
- **SEO Optimized**: Includes dynamic metadata, a `sitemap.xml`, and `robots.txt` for optimal search engine ranking.
- **Dark Mode**: A fully implemented dark mode for user preference.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication & Database**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
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
2. Create a `.env` file in the root of the project and add your Firebase and Resend API keys. You can get your Firebase web app config from the Firebase console.
   ```env
   # Firebase Client SDK Keys
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

   # Firebase Admin SDK Keys (for server-side operations)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
   # Important: The private key must be a single line string. Copy the key and replace all newlines with \n
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Resend API Key (for contact form)
   NEXT_PUBLIC_RESEND_API_KEY=re_...
   ```
   **Note**: For `FIREBASE_PRIVATE_KEY`, ensure the value is enclosed in double quotes (`"`) and newlines are represented as `\n`.

3. Install NPM packages
   ```sh
   npm install
   ```
4. Run the development server
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:9002`.

## Admin Access

To access the dashboard and other admin features, use one of the emails pre-configured in `src/context/auth-context.ts`:
- **Default Emails**: `dev@sidepe.com` or `rd.lapawawoi@gmail.com`

You can sign up with one of these emails and any password to gain admin access.

## Troubleshooting

If you encounter persistent issues with dependencies after pulling changes, it can be helpful to clear out the old packages and reinstall from scratch.

```sh
rm -rf node_modules package-lock.json
npm install
```
