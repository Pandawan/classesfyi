import * as admin from "firebase-admin";

// Initialize firebase admin (auto-fetches firebase config from environment)
admin.initializeApp();
export const store = admin.firestore();

export { getUserClasses } from "./user";
export { registerClasses } from "./register";
export { unregisterClasses } from "./unregister";
export { unregisterAllClasses } from "./unregisterAll";
export { updateClassesData } from "./update";
export { test } from "./update";
