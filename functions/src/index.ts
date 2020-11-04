import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize firebase admin (auto-fetches firebase config from environment)
admin.initializeApp();
export const store = admin.firestore();

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});
