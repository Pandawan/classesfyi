import {
  Router,
  send,
  Middleware,
} from "https://deno.land/x/oak@v6.2.0/mod.ts";

const router = new Router();

// Respond to any request
router.use(async (context) => {
  console.log("Any path");
  await send(context, `web/dist/index.html`);
});

const staticMiddleware: Middleware = async (context, next) => {
  if (context.request.url.pathname.startsWith("/_assets") === false) {
    await next();
    return;
  } else {
    await context.send({
      root: `web/dist`,
    });
  }
};

export { router, staticMiddleware /* notFound */ };
