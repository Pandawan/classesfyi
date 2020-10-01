import { Router, Status } from "https://deno.land/x/oak@v6.3.0/mod.ts";

import { match } from "https://raw.githubusercontent.com/pillarjs/path-to-regexp/v6.1.0/src/index.ts";

const router = new Router();

router.get("/robots.txt", async (context) => {
  context.response.body = [
    "User-agent: *",
    "Disallow: /user/*",
    "Disallow: /lookup/",
  ].join("\n");

  context.response.status = Status.OK;
  context.response.type = "text/plain";
});

router.get("/_assets/:file", async (context) => {
  await context.send({
    root: "web/dist",
  });
});

// TODO: Find a way to path match and retunr a 404 without having to hardcode them separately from vue.
const validPaths = [
  "/",
  "/about",
  "/lookup/:campusId?/:departmentId?/:courseId?",
  "/user/:email?",
].map((path) => match(path));

// TODO: Oak does not support router.use middlewares (see https://github.com/oakserver/oak/issues/214)
router.get("/(.*)", async (context) => {
  const isValidPath = validPaths.some((pathMatcher) =>
    pathMatcher(context.request.url.pathname)
  );

  if (isValidPath === false) {
    context.response.status = 404;
  }

  await context.send({ path: "index.html", root: "web/dist" });
});

export { router };
