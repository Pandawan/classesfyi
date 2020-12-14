import * as functions from "firebase-functions";

import { store } from "./index";
import { removeUnusedClasses } from "./utilities/unusedClasses";
import {
  createErrorResponse,
  createSuccessResponse,
} from "./utilities/response";
import { verifyEmail } from "./utilities/verifyEmail";

/**
 * Unregister the given user from all updates.
 * 
 * Path: `/unregisterAllClasses`
 * 
 * Body: `{ email: string }`
 */
export const unregisterAllClasses = functions.https.onRequest(
  async (request, response) => {
    // Get & verify email
    const emailResult = verifyEmail(request.body?.email);
    if (emailResult.type === "error") {
      response.status(400).send(createErrorResponse(emailResult.message));
      return;
    }
    const email = emailResult.value;

    const userRef = store.collection("users").doc(email);

    const user = await userRef.get();
    const registeredClasses = user.exists
      ? user.data()?.registered_classes
      : undefined;

    // Delete user if it exists (ignore error if it doesn't exist)
    await userRef.delete();

    // Delete any class that the user was registered to and is no longer used
    if (registeredClasses !== undefined && Array.isArray(registeredClasses)) {
      await removeUnusedClasses(registeredClasses);
    }

    response.send(
      createSuccessResponse("Successfully unregistered user from all classes."),
    );
  },
);
