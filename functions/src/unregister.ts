import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { store } from "./index";
import { ClassData, isClassData } from "./utilities/classData";
import {
  createErrorResponse,
  createSuccessResponse,
} from "./utilities/response";
import { verifyEmail } from "./utilities/verifyEmail";
import { isClassUnused } from "./utilities/isClassUnused";

/**
 * Unregister the given user from updates from the given classes.
 * 
 * Path: `/unregisterClasses`
 * 
 * Body:
 * ```
 * { 
 *  email: string, 
 *  classes: ClassData[] 
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
      .filter((potentialClass: any) => isClassData(potentialClass) === false);
    if (invalidClasses.length !== 0) {
      response.status(400).send(createErrorResponse(
        `Classes must be objects in the format { campus: string, department: string, course: string, crn: number }`,
        invalidClasses,
      ));
      return;
    }

    const classesToLookFor: ClassData[] = potentialClassList;
    const classesToRemoveFromUser: FirebaseFirestore.DocumentReference[] = [];

    if (
      registeredClasses === undefined ||
      Array.isArray(registeredClasses) === false
    ) {
      functions.logger.error(
        `User ${email} does not have a registered_classes field.`,
        registeredClasses,
      );
      response.send(
        createErrorResponse("User was not registered to any class."),
      );
      return;
    }

    // Loop through all registered classes and check which match with the list that was given
    for (const registeredClass of registeredClasses) {
      if (registeredClass instanceof admin.firestore.DocumentReference) {
        const registeredClassData = (await registeredClass.get()).data();

        const classShouldBeRemoved = classesToLookFor.some((classData) =>
          classData.crn === registeredClassData?.crn &&
          classData.course === registeredClassData?.course &&
          classData.department === registeredClassData?.department &&
          classData.campus === registeredClassData?.campus
        );

        if (classShouldBeRemoved) {
          classesToRemoveFromUser.push(registeredClass);
        }
      }
    }

    // There are classes to remove
    if (classesToRemoveFromUser.length !== 0) {
      // Write all the class removing operations at the end, so that any error occuring means nothing gets written
      await userRef.update({
        registered_classes: admin.firestore.FieldValue.arrayRemove(
          ...classesToRemoveFromUser,
        ),
      });

      // Perform class cleanup if needed, create a list of class deletion tasks
      const tasks = classesToRemoveFromUser.map(async (classToRemove) => {
        if (await isClassUnused(classToRemove)) {
          await classToRemove.delete();
        }
      });
      // Wait for class deletion to finish
      await Promise.all(tasks);

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
      response.send(
        createErrorResponse(
          "Something went wrong, there were no classes to unregister from.",
        ),
      );
    }
  },
);
