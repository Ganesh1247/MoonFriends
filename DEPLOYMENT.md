# Moon Friends deployment guide

This app is a Next.js project that uses Firebase for authentication and Firestore.

## Recommended free-tier hosting

Use Vercel for the app and Firebase for auth/database.

## 1) Prepare Firebase

In the Firebase Console:

- Create or select the project
- Enable Firebase Authentication
- Enable Firestore Database
- Enable Firebase Storage
- Ensure the web app config matches the values in `.env.local`

Add these to Vercel environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `SESSION_SECRET`

Do not commit real values to GitHub.

## 2) Deploy to Vercel

1. Push the repo to GitHub.
2. Open Vercel and import the repository.
3. Set the framework to Next.js.
4. Add the environment variables above.
5. Deploy.

## 3) Add the Vercel domain to Firebase Auth

In Firebase Console > Authentication > Settings > Authorized domains:

- add the production Vercel domain, such as:
  - `your-project.vercel.app`

## 4) Firestore rules

This app writes via server-side admin actions. Ensure the Firestore rules allow authenticated access to the collections used by the app.

## 5) Google login

If using Google sign-in, enable Google in Firebase Authentication and add the deployed domain to the OAuth redirect configuration.

## 6) Local development

Copy `.env.example` to `.env.local` and fill the values before running the app locally.

```bash
cp .env.example .env.local
npm run dev
```

## Notes

- Do not commit `.env.local`
- Do not add secret JSON files to GitHub
- Vercel is the easiest free-tier option for a Next.js app like this
