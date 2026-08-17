import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "firebase-admin",
    "jwks-rsa",
    "jose",
    "google-auth-library",
    "@google-cloud/firestore",
    "@google-cloud/storage",
  ],
};

export default nextConfig;
