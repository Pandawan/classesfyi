import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { store } from "./index";
import {
  ClassInfo,
  classInfoFormat,
  cleanupClassInfo,
  isClassInfo,
} from "./utilities/classData";
import {
  createErrorResponse,
  createSuccessResponse,
} from "./utilities/response";
import { verifyEmail } from "./utilities/verifyEmail";

/**
 * Register the given user for updates from the given classes.
 * 
 * Path: `/registerClasses`
 * 
 * Body:
 * ```
 * { 
 *  email: string, 
 *  classes: ClassInfo[] 
 * }
 * ```
 */
export const registerClasses = functions.https.onRequest(
  async (request, response) => {
    // Get & verify email
    const emailResult = verifyEmail(request.body?.email);
    if (emailResult.type === "error") {
      response.status(400).send(createErrorResponse(emailResult.message));
      return;
    }
    const email = emailResult.value;

    // Verify classes is an array
    const potentialClassList = request.body?.classes;
    if (
      potentialClassList === undefined ||
      Array.isArray(potentialClassList) === false ||
      potentialClassList.length === 0
    ) {
      response.status(400).send(
        createErrorResponse(
          "Classes field is required and must be a non-empty array of classes.",
        ),
      );
      return;
    }

    // Validate each class' format
    const invalidClasses = potentialClassList
      .filter((potentialClass: any) => isClassInfo(potentialClass) === false);
    if (invalidClasses.length !== 0) {
      response.status(400).send(createErrorResponse(
        [
          `Classes must be objects in the format ${classInfoFormat}.`,
          `Got: ${JSON.stringify(invalidClasses)}`,
        ].join("\n"),
      ));
      return;
    }

    // Get & verify user
    // After verifying class format so we know it's okay to create the user
    const userRef = store.collection("users").doc(email);
    // Create if it doesn't exist
    if ((await userRef.get()).exists === false) {
      // NOTE: Not updating user snapshot because only care about the reference to it, not its data.
      await userRef.create({ registered_classes: [] });
    }

    // Make a list of classes to add
    const classesToAdd: ClassInfo[] = potentialClassList
      // Clean up the data for database usage
      .map((classData: ClassInfo) => cleanupClassInfo(classData));
    // TODO: Could check if userData already contains classes, and don't include those (return a 'duplicated')

    if (classesToAdd.length !== 0) {
      // Add the classes to the user's registered classes list
      await userRef.update({
        registered_classes: admin.firestore.FieldValue.arrayUnion(
          ...classesToAdd,
        ),
      });

      response.send(
        createSuccessResponse("Successfully registered for classes."),
      );
    } else {
      response.status(500).send(
        createErrorResponse(
          "Something went wrong, there were no classes to register.",
        ),
      );
    }
  },
);
