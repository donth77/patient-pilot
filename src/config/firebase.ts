import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { readFileSync } from "fs";
import * as path from "path";

// Initialize Firebase Admin SDK only once
if (getApps().length === 0) {
  try {
    const serviceAccountPath = path.join(
      process.cwd(),
      "firebase-credentials.json"
    );
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw new Error("Firebase initialization failed");
  }
}

// Export the initialized app
export const firebaseApp = getApp();
