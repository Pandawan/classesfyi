import {
  Router,
  send,
  Middleware,
  Status,
} from "https://deno.land/x/oak@v6.1.0/mod.ts";
const router = new Router();

router.get("/", async (context) => {
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

// A basic 404 page
const notFound: Middleware = async (context) => {
  context.response.status = Status.NotFound;
  await send(context, `web/dist/index.html`);
};

export { router, staticMiddleware, notFound };
