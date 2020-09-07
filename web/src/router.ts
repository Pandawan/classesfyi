import { createWebHistory, createRouter } from "vue-router";

import Home from "./views/Home.vue";
import NotFound from "./views/NotFound.vue";

const history = createWebHistory();

const routes = [
  { path: "/", component: Home },
  { path: "/:catchAll(.*)", component: NotFound },
];

const router = createRouter({ history, routes });

export default router;
