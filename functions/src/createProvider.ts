// functions/createProvider.ts
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";

// Only initialize if not already initialized
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

interface Provider {
  email: string;
  name: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  profileImageUrl?: string | null;
}

export const createProviderDoc = functions.auth
  .user()
  .onCreate(async (user) => {
    const { uid, email, displayName } = user;

    const payload: Provider = {
      email: email || `provider-${uid}@patientpilot.com`,
      name: displayName || `Provider ${uid.substring(0, 8)}`,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      profileImageUrl: null,
    };

    try {
      await db.collection("providers").doc(uid).set(payload);
      console.log(`✅ Provider document created for user: ${uid}`);
    } catch (error) {
      console.error("Error creating provider document:", error);
      throw error;
    }
  });
