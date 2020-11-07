import * as admin from "firebase-admin";
import { store } from "../index";

/**
 * Checks if the given class reference is used by any user in the database.
 * @param classRef Firestore reference to a class
 */
export async function isClassUnused(
  classRef: admin.firestore.DocumentReference,
): Promise<boolean> {
  const usersWithClassRef = await store.collection("users").where(
    "registered_classes",
    "array-contains",
    classRef,
  ).get();
  return usersWithClassRef.empty;
}
