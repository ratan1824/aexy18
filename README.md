# Aexy - AI English Practice Partner

Aexy is a Next.js application designed to help users practice their English conversation skills through interactive AI-powered scenarios. Users can choose a scenario, engage in a conversation with an AI, and receive real-time feedback on grammar, pronunciation, and language use.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative**: [Google's Gemini via Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)

---

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Installation

First, clone the repository and navigate into the project directory:

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

Next, install the necessary dependencies:

```bash
npm install
```

### 3. Environment Variables (Critical for Security)

This project requires an API key to connect to Google's AI services (Gemini). To keep this key secure, you **must** use environment variables.

**Never commit API keys directly to your repository.**

1.  **Create a local environment file:**
    In the root of the project, create a file named `.env.local`. This file is already listed in `.gitignore` to prevent it from being accidentally committed.

    ```bash
    touch .env.local
    ```

2.  **Add your Gemini API Key:**
    Open the `.env.local` file and add your Gemini API key. You can get this key from [Google AI Studio](https://makersuite.google.com/app/apikey).

    ```.env.local
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

    **Note:** The public-facing Firebase configuration in `src/firebase/config.ts` is safe to keep in your code. Your app's security is handled by Firestore Security Rules, not by hiding those particular keys.

### 4. Running the Development Server

Once your environment variables are set, you can start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

---

## Deployment to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com/), the platform from the creators of Next.js.

### Connecting to Vercel via GitHub

1.  **Push to GitHub:** Create a new repository on GitHub and push your project code to it.
2.  **Import Project on Vercel:**
    - Go to your Vercel dashboard and click "Add New... > Project".
    - Select and import your new GitHub repository.
    - Vercel will automatically detect that it's a Next.js project and configure the build settings for you.

### Adding Environment Variables to Vercel

This is the most important step for a successful and secure deployment.

1.  In your new Vercel project's dashboard, go to the **Settings** tab.
2.  Click on **Environment Variables** in the left sidebar.
3.  Add a new variable:
    - **Name:** `GEMINI_API_KEY`
    - **Value:** Paste the same Gemini API key you used in your `.env.local` file.
4.  Click **Save**.

### Deploy

After adding the environment variable, go to the **Deployments** tab in Vercel and trigger a new deployment. Vercel will build your project using your secret key without it ever being exposed in your source code. Vercel will assign a new, unique URL to this deployment.
