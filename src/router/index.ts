import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/gatekeeper" },
  {
    path: "/home",
    component: () => import("/@/pages/index.vue"),
  },
  {
    path: "/gatekeeper",
    component: () => import("/@/pages/gatekeeper/index.vue"),
  },
  {
    path: "/surveillance",
    component: () => import("../pages/surveillance/surveillance.vue"),
  },
  {
    path: "/weighbridge",
    component: () => import("../pages/weighbridge/index.vue"),
  },
  {
    path: "/yiyan",
    component: () => import("../pages/yiyan/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
