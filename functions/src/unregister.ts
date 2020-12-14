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
import { removeUnusedClasses } from "./utilities/unusedClasses";

/**
 * Unregister the given user from updates from the given classes.
 * 
 * Path: `/unregisterClasses`
 * 
 * Body:
 * ```
 * { 
 *  email: string, 
 *  classes: ClassInfo[] 
 * }
 * ```
 */
export const unregisterClasses = functions.https.onRequest(
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
    const registeredClasses = user.data()?.registered_classes;

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

    const classesToRemove: ClassInfo[] = potentialClassList
      // Clean up the data for database usage
      .map((classData: ClassInfo) => cleanupClassInfo(classData));

    if (
      registeredClasses === undefined ||
      Array.isArray(registeredClasses) === false
    ) {
      functions.logger.error(
        `User ${email} does not have a registered_classes field.`,
        registeredClasses,
      );
      response.status(400).send(
        createErrorResponse("User is not registered to any class."),
      );
      return;
    }

    // There are classes to remove
    if (classesToRemove.length !== 0) {
      // Write all the class removing operations at the end, so that any error occuring means nothing gets written
      await userRef.update({
        registered_classes: admin.firestore.FieldValue.arrayRemove(
          ...classesToRemove,
        ),
      });

      // Delete any class that is being removed and is no longer being used
      await removeUnusedClasses(classesToRemove);

      // Check if user is no longer registered to any classes, if so, delete it
      const newRegisteredClasses = (await userRef.get()).data()
        ?.registered_classes;
      if (
        newRegisteredClasses === undefined || newRegisteredClasses.length === 0
      ) {
        await userRef.delete();
      }

      response.send(
        createSuccessResponse("Successfully unregistered user from classes."),
      );
    } else {
      response.status(500).send(
        createErrorResponse(
          "Something went wrong, there were no classes to unregister from.",
        ),
      );
    }
  },
);
