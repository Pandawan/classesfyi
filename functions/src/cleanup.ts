import * as functions from "firebase-functions";
import { ClassInfo } from "./utilities/classData";
import { removeUnusedClasses } from "./utilities/unusedClasses";

/**
 * Clean up any class that a user has removed from their list 
 * and that is no longer registered by any user.
 * 
 * This is a firestore trigger function called automatically when a user document changes.
 */
export const cleanupUnusedClasses = functions.firestore.document(
  "users/{userEmail}",
).onWrite(async (change, context) => {
  // User was created, ignore
  if (change.before.exists === false) return;

  const previousRegisteredClasses: ClassInfo[] | null | undefined = change
    .before.data()?.registered_classes;
  // If user did not previously have any classes, nothing to do
  if (
    previousRegisteredClasses === undefined ||
    previousRegisteredClasses === null ||
    (Array.isArray(previousRegisteredClasses) &&
      previousRegisteredClasses.length === 0)
  ) {
    return;
  }

  // User was deleted, clean up
  if (change.before.exists === true && change.after.exists === false) {
    await removeUnusedClasses(previousRegisteredClasses);
    return;
  }

  const newRegisteredClasses: ClassInfo[] | null | undefined = change.after
    .data()?.registered_classes;
  // If user does not have new registered classes, ignore
  if (
    newRegisteredClasses === undefined ||
    newRegisteredClasses === null ||
    (Array.isArray(newRegisteredClasses) &&
      newRegisteredClasses.length === 0)
  ) {
    return;
  }

  // Generate a list of classes that previously were registered but no longer are.
  const removedClasses = previousRegisteredClasses.filter((
    previousClassInfo,
  ) =>
    // Try to find a class in the new list that matches the previous one
    newRegisteredClasses.findIndex((newClassInfo) =>
      newClassInfo.crn === previousClassInfo.crn &&
      newClassInfo.term === previousClassInfo.term &&
      newClassInfo.year === previousClassInfo.year &&
      newClassInfo.campus === previousClassInfo.campus
    ) === -1 // If it is not matched, keep it in this list (filter)
  );
  // If no classes were removed, ignore
  if (removedClasses.length === 0) return;

  // User removed some classes, clean up
  await removeUnusedClasses(removedClasses);
});
