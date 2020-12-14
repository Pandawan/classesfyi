import * as functions from "firebase-functions";

import { store } from "./index";
import { verifyEmail } from "./utilities/verifyEmail";
import {
  createErrorResponse,
  createSuccessResponse,
} from "./utilities/response";
import { ClassInfo } from "./utilities/classData";

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
    const registeredClasses: ClassInfo[] | undefined = user.data()
      ?.registered_classes;
    if (registeredClasses === undefined) {
      functions.logger.error(
        `User ${email} does not have a registered_classes field.`,
      );
      // Recover from error by sending null
      response.send(createSuccessResponse(null));
      return;
    }

    response.send(createSuccessResponse(registeredClasses));
  },
);
