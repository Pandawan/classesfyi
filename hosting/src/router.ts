import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Home from "./views/Home/Home.vue";
import About from "./views/About.vue";
import User from "./views/User.vue";
import CampusLookup from "./views/Lookup/CampusLookup.vue";
import DepartmentLookup from "./views/Lookup/DepartmentLookup.vue";
import CourseLookup from "./views/Lookup/CourseLookup.vue";
import NotFound from "./views/NotFound.vue";

/**
 * Small utility to prefix routes
 * (since vue-router does not support nested routes without a parent component)
 * @see https://github.com/vuejs/vue-router/issues/3156
 */
const withPrefix = (prefix: string, routes: RouteRecordRaw[]) =>
  routes.map((route) => {
    route.path = prefix + route.path;
    return route;
  });

const history = createWebHistory();

const routes = [
  {
    path: "/",
    component: Home,
    name: "home",
  },
  {
    path: "/about",
    component: About,
    name: "about",
  },
  {
    path: "/user",
    component: User,
    name: "user",
  },
  ...withPrefix("/lookup", [
    {
      path: "/:campusId",
      component: CampusLookup,
      name: "lookup_campus",
    },
    {
      path: "/:campusId/:departmentId",
      component: DepartmentLookup,
      name: "lookup_department",
    },
    {
      path: "/:campusId/:departmentId/:courseId",
      component: CourseLookup,
      name: "lookup_course",
    },
  ]),
  {
    path: "/:catchAll(.*)",
    component: NotFound,
    name: "not_found",
  },
];

const router = createRouter({ history, routes });

export default router;
