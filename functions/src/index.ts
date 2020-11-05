import * as admin from "firebase-admin";

// Initialize firebase admin (auto-fetches firebase config from environment)
admin.initializeApp();
export const store = admin.firestore();

export * from "./user";
export * from "./register";
