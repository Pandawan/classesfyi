import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { store } from "./index";
import { verifyEmail } from "./utilities/verifyEmail";
import {
  createErrorResponse,
  createSuccessResponse,
} from "./utilities/response";

/**
 * Get an user's currently registered classes.
 * 
 * Path: `/getUserClasses`
 * 
 * Body: `{ email: string }`
 */
export const getUserClasses = functions.https.onRequest(
  async (request, response) => {
    // Get & verify email
    const emailResult = verifyEmail(request.body?.email);
    if (emailResult.type === "error") {
      response.status(400).send(createErrorResponse(emailResult.message));
      return;
    }
    const email = emailResult.value;

    // Get & verify user
    const userRef = store.collection("users").doc(email);
    const user = await userRef.get();
    if (user.exists === false) {
      response.status(404).send(createErrorResponse("User not found."));
      return;
    }

    // Get & verify user's registered_classes field
    const registeredClasses:
      | (FirebaseFirestore.DocumentReference | string)[]
      | undefined = user.data()
        ?.registered_classes;
    if (registeredClasses === undefined) {
      functions.logger.error(
        `User ${email} does not have a registered_classes field.`,
      );
      // Recover from error by sending null
      response.send(createSuccessResponse(null));
      return;
    }

    // Process user's list of registered classes
    const tasks = registeredClasses
      // Filter out unknown class references
      .filter(
        (
          registeredClass,
        ): registeredClass is FirebaseFirestore.DocumentReference => {
          // If reference is a string, it means it wasn't found
          if (typeof registeredClass === "string") {
            functions.logger.error(
              `User ${email} references a class that does not exist:`,
              registeredClass,
            );
            // Recover from error by ignoring/filtering it
            return false;
          } // If reference is neither a string nor a reference, then something is wrong with the underlying data
          else if (
            (registeredClass instanceof admin.firestore.DocumentReference) ===
              false
          ) {
            functions.logger.error(
              `User ${email} references a class that with an unknown format:`,
              registeredClass,
            );
            // Recover from error by ignoring/filtering it
            return false;
          }
          // Otherwise, it must be a document reference, everything is good
          return true;
        },
      )
      // Get each reference's class data
      .map(async (registeredClass) => (await registeredClass.get()).data());

    const classesWithData = await Promise.all(tasks);

    const cleanedUpData = classesWithData.map((data) => {
      if (data && data.previous_data) {
        delete data.previous_data;
      }
      return data;
    });

    response.send(createSuccessResponse(cleanedUpData));
  },
);
