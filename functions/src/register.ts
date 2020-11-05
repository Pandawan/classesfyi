import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { store } from "./index";

/**
 * Register the given user for updates from the given classes.
 * 
 * Path: `/registerClasses`
 * 
 * Body:
 * ```
 * { 
 *  email: string, 
 *  classes: { 
 *    campus: string, 
 *    department: string, 
 *    course: string, 
 *    crn: number 
 *  }[] 
 * }
 * ```
 */
export const registerClasses = functions.https.onRequest(
  async (request, response) => {
    // Get & verify request params
    const email = request.body?.email;
    if (email === undefined) {
      response.status(400).send("Email field is required.");
      return;
    } else if (typeof email !== "string") {
      response.status(400).send("Email must be a string.");
      return;
    }

    // Get & verify user
    const user = await store.collection("users").doc(email).get();
    if (user.exists === false) {
      response.status(404).send("User not found.");
      return;
    }

    const classesToLookFor = request.body?.classes;
    if (classesToLookFor === undefined) {
      response.status(400).send("Classes field is required.");
      return;
    } else if (Array.isArray(classesToLookFor) === false) {
      response.status(400).send("Classes must be an array of classes.");
      return;
    } else if (classesToLookFor.length === 0) {
      response.status(400).send("Classes array must not be empty.");
      return;
    }

    const classesToAdd = [];

    // TODO: Attempt to register for all classes and report all the ones that succeeded & failed instead of stopping at first error

    // Loop through user given list of classes
    for (const classToLookFor of classesToLookFor) {
      // Validate the class parameters
      if (
        typeof classToLookFor !== "object" ||
        typeof classToLookFor.campus !== "string" ||
        typeof classToLookFor.department !== "string" ||
        typeof classToLookFor.course !== "string" ||
        typeof classToLookFor.crn !== "number"
      ) {
        response.status(400).send(
          "Class must be an object in the format { campus: string, department: string, course: string, crn: number }",
        );
        return;
      }

      // Look for class with those exact criteria
      const classToRegister = await store.collection("classes")
        .where("campus", "==", classToLookFor.campus)
        .where("department", "==", classToLookFor.department)
        .where("course", "==", classToLookFor.course)
        .where("crn", "==", classToLookFor.crn)
        .get();

      // Report not found immediately and stop
      if (classToRegister.empty) {
        response.status(404).send(
          `Could not find class with given parameters: ${
            JSON.stringify(classToLookFor)
          }`,
        );
        return;
      }

      // Check that only one class matches these criteria, but recover graciously if more than one
      if (classToRegister.size !== 1) {
        functions.logger.error(
          "More than one class found for query",
          classToLookFor,
        );
      }

      // Push class to register references to list of classes to add
      classesToAdd.push(...classToRegister.docs.map((doc) => doc.ref));
    }

    if (classesToAdd.length !== 0) {
      // Write all the classes at the end, so that any error occuring means nothing gets written.
      await user.ref.update({
        registered_classes: admin.firestore.FieldValue.arrayUnion(
          ...classesToAdd,
        ),
      });

      response.send("Successfully registered for classes.");
    }
  },
);
