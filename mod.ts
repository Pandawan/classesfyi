import {
  Application,
  send,
  isHttpError,
  Status,
} from "https://deno.land/x/oak@v6.1.0/mod.ts";
import {
  green,
} from "https://deno.land/std@0.68.0/fmt/colors.ts";
import logger from "./server/logger.ts";
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

app.use(logger.logger);
app.use(logger.responseTime);

// Add router middleware
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Start server
app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(
    `Listening on: ${green(url)}`,
  );
});

await app.listen({ port: 3000 });

console.log("Finished");
