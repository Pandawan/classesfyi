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

// TODO: Add a pubsub that automatically removes any class that is unused
/* 
  // Perform class cleanup if needed, create a list of class deletion tasks
  const tasks = classesToRemoveFromUser.map(async (classToRemove) => {
    if (await isClassUnused(classToRemove)) {
      await classToRemove.delete();
    }
  });
  // Wait for class deletion to finish
  await Promise.all(tasks);
*/
