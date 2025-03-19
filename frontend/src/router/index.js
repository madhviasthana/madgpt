import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import TextDiagramView from "../views/TextDiagramView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/text-to-diagram",
      name: "TextToDiagram",
      component: TextDiagramView,
    },
  ],
});

export default router;
