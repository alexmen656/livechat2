import { createRouter, createWebHistory } from "vue-router";
import StartView from "@/views/StartView.vue";
import ChatView from "@/views/ChatView.vue";

const routes = [
  {
    path: "/",
    name: "StartView",
    component: StartView,
  },
  {
    path: "/room/:roomId",
    name: "ChatView",
    component: ChatView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
