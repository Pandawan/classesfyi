import { store } from "../index";
import { ClassInfo } from "./classData";

/**
 * Checks if the given class reference is used by any user in the database.
 * @param classRef Firestore reference to a class
 */
export async function isClassUnused(
  classInfo: ClassInfo,
): Promise<boolean> {
  const usersWithClassRef = await store.collection("users").where(
    "registered_classes",
    "array-contains",
    classInfo,
  ).get();
  return usersWithClassRef.empty;
}

/**
 * Checks and removes any class that is unused in the given list.
 * @param classesToCheck List of classes to check for
 */
export async function removeUnusedClasses(classesToCheck: ClassInfo[]) {
  const tasks = classesToCheck.map(async (classToCheck) => {
    // If class is not being used, it's safe to remove it
    if (await isClassUnused(classToCheck)) {
      // Find the actual class ref
      const classRefsToRemove = await store.collection("classes")
        .where("campus", "==", classToCheck.campus)
        .where("year", "==", classToCheck.year)
        .where("term", "==", classToCheck.term)
        .where("crn", "==", classToCheck.crn)
        .get();

      // Loop through all class references that matched
      if (classRefsToRemove.empty === false) {
        for (const classRefToRemove of classRefsToRemove.docs) {
          await classRefToRemove.ref.delete();
        }
      }
    }
  });

  await Promise.all(tasks);
}
