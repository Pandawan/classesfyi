import {
  green,
  cyan,
  white,
  red,
  bgYellow,
} from "https://deno.land/std@0.71.0/fmt/colors.ts";
import {
  Status,
  Context,
  Middleware,
} from "https://deno.land/x/oak@v6.3.0/mod.ts";
const X_RESPONSE_TIME: string = "X-Response-Time";

export const logger: Middleware = async (
  { request, response }: Context,
  next: Function,
) => {
  await next();
  const responseTime = response.headers.get(X_RESPONSE_TIME);
  const notFound = response.status === Status.NotFound;
  console.log(
    `${green(request.method)} ${cyan(request.url.pathname)} ${
      notFound ? red("Not Found") : ""
    } ${bgYellow(white(String(responseTime)))}`,
  );
};

export const responseTime: Middleware = async (
  { response }: Context,
  next: Function,
) => {
  const start = Date.now();
  await next();
  const ms: number = Date.now() - start;
  response.headers.set(X_RESPONSE_TIME, `${ms}ms`);
};
