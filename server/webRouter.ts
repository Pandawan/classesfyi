import {
  Router,
  send,
} from "https://deno.land/x/oak@v6.1.0/mod.ts";

const router = new Router();

router.get("/", async (context) => {
  await send(context, "/web/index.html");
});

export default router;
