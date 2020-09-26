import {
  Application,
  isHttpError,
  send,
} from "https://deno.land/x/oak@v6.2.0/mod.ts";
import { green } from "https://deno.land/std@0.71.0/fmt/colors.ts";
import {
  router as webRouter,
  staticMiddleware,
  //notFound,
} from "./server/middlewares/webRouter.ts";
import { router as apiRouter } from "./server/middlewares/apiRouter.ts";
import { logger, responseTime } from "./server/middlewares/logger.ts";
import { updateTask } from "./server/tasks/updateTask.ts";
import { config } from "https://deno.land/x/dotenv@v0.5.0/mod.ts";
import { strToBool } from "./server/utilities/strToBool.ts";

const DEV_MODE = strToBool(config().DEV_MODE, true);

// Start the updates/refresh task
const cancelUpdates = updateTask();

// Prepare app
const app = new Application();

// Error handler
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      context.response.status = err.status;
      const { message, status, stack } = err;
      if (context.request.accepts("json")) {
        context.response.body = { message, status, stack };
        context.response.type = "json";
      } else {
        context.response.body = `${status} ${message}\n\n${stack ?? ""}`;
        context.response.type = "text/plain";
      }
    } else {
      console.log(err);
      throw err;
    }
  }
});

app.use(logger);
app.use(responseTime);

// Add router middleware
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());
/*
app.use(webRouter.routes());
app.use(webRouter.allowedMethods());
*/

// Handle static content
app.use(staticMiddleware);
app.use(async (context) => {
  await send(context, `web/dist/index.html`);
});
// app.use(notFound);

// Start server
app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on: ${green(url)}`);
});
await app.listen(
  DEV_MODE
    ? {
      port: 3000,
    }
    : {
      port: 443,
      secure: true,
      certFile: "./admin/classes.fyi.pem",
      keyFile: "./admin/classes.fyi.key",
    },
);

// Stop the updates interval, the program is done
cancelUpdates();
console.log("Finished");
