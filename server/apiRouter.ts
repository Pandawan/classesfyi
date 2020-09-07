import {
  Router,
} from "https://deno.land/x/oak@v6.1.0/mod.ts";
import { register, unregister, unregisterAll, refresh } from "../lib.ts";
import { validateRegistrationData } from "../data.ts";

/*
    Want Http server
        /register POST { email, classes: { campus, department, course, crn }[] }
        /unregister POST { email, classes: { campus, department, course, crn }[] }
        /unregister_all POST { email }
        /refresh POST
*/

const router = new Router();

router.post("/register", async (context) => {
  if (context.request.hasBody === false) {
    context.response.body = {
      type: "request_error",
      error: "Request body is required.",
    };
    context.response.status = 400;
    return;
  }

  const body = await context.request.body({ type: "json" }).value;

  const validationErrors = validateRegistrationData(body);
  if (validationErrors.length !== 0) {
    context.response.body = {
      type: "validation_error",
      error: validationErrors,
    };
    context.response.status = 400;
    return;
  }

  const response = register(body);

  context.response.body = response;
});

router.post("/unregister", async (context) => {
  if (context.request.hasBody === false) {
    context.response.body = {
      type: "request_error",
      error: "Request body is required.",
    };
    context.response.status = 400;
    return;
  }

  const body = await context.request.body({ type: "json" }).value;

  const validationErrors = validateRegistrationData(body);
  if (validationErrors.length !== 0) {
    context.response.body = {
      type: "validation_error",
      error: validationErrors,
    };
    context.response.status = 400;
    return;
  }

  const response = unregister(body);

  context.response.body = response;
});

router.post("/unregister_all", async (context) => {
  if (context.request.hasBody === false) {
    context.response.body = {
      type: "request_error",
      error: "Request body is required.",
    };
    context.response.status = 400;
    return;
  }

  const body = await context.request.body({ type: "json" }).value;

  if (!body["email"] || typeof body["email"] !== "string") {
    context.response.body = {
      type: "validation_error",
      error: "Expected body with email address",
    };
    context.response.status = 400;
    return;
  }

  const response = unregisterAll(body.email);

  context.response.body = response;
});

router.post("/refresh", async (context) => {
  const response = await refresh();
  context.response.body = response;
});

export default router;
