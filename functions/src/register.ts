import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { store } from "./index";
import {
  ClassData,
  cleanupClassData,
  isClassData,
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
 *  classes: ClassData[] 
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

    // Get & verify user
    const userRef = store.collection("users").doc(email);
    if ((await userRef.get()).exists === false) {
      // NOTE: Not updating user snapshot because only care about the reference to it, not its data.
      await userRef.create({ registered_classes: [] });
    }

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
      .filter((potentialClass: any) => isClassData(potentialClass) === false);
    if (invalidClasses.length !== 0) {
      response.status(400).send(createErrorResponse(
        [
          `Classes must be objects in the format { campus: string, department: string, course: string, crn: number }.`,
          `Got: ${JSON.stringify(invalidClasses)}`,
        ].join("\n"),
      ));
      return;
    }

    // Make a list of classes to look for
    const classesToLookFor: ClassData[] = potentialClassList
      // Clean up the data for database usage
      .map((classData: ClassData) => cleanupClassData(classData, false));
    const classesToAddToUser: FirebaseFirestore.DocumentReference[] = [];

    // Loop through user given list of classes
    for (const classToLookFor of classesToLookFor) {
      // Look for class with those exact criteria
      const classToRegister = await store.collection("classes")
        .where("campus", "==", classToLookFor.campus)
        .where("department", "==", classToLookFor.department)
        .where("course", "==", classToLookFor.course)
        .where("crn", "==", classToLookFor.crn)
        .get();

      // Create class that hasn't been registered before
      if (classToRegister.empty) {
        const newClassRef = store.collection("classes").doc();
        // Create that class
        await newClassRef.create({
          campus: classToLookFor.campus.toLowerCase(),
          department: classToLookFor.department.toLowerCase(),
          course: classToLookFor.course.toLowerCase(),
          crn: classToLookFor.crn,
        });
        classesToAddToUser.push(newClassRef);
      } // Class does exist
      else {
        // Check that only one class matches these criteria, but recover graciously if more than one
        if (classToRegister.size !== 1) {
          functions.logger.error(
            "More than one class found for query",
            classToLookFor,
          );
        }

        // Push class to register references to list of classes to add
        classesToAddToUser.push(...classToRegister.docs.map((doc) => doc.ref));
      }
    }

    if (classesToAddToUser.length !== 0) {
      // Write all the classes at the end, so that any error occuring means nothing gets written.
      await userRef.update({
        registered_classes: admin.firestore.FieldValue.arrayUnion(
          ...classesToAddToUser,
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
