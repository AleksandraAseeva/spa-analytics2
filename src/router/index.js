import { createRouter, createWebHistory } from "vue-router";
import Stocks from "@/views/StocksView.vue";
import Incomes from "@/views/IncomesView.vue";
import Orders from "@/views/OrdersView.vue";
import Sales from "@/views/SalesView.vue";
import Home from "@/views/HomeView.vue";

import MetricView from '@/views/MetricView.vue'
import ProductView from '@/views/ProductView.vue'

const routes = [
  {
    path: "/stocks",
    name: "Stocks",
    component: Stocks,
  },
  {
    path: "/incomes",
    name: "Incomes",
    component: Incomes,
  },
  {
    path: "/orders",
    name: "Orders",
    component: Orders,
  },
  {
    path: "/sales",
    name: "Sales",
    component: Sales,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/metric/:metric",
    name: "metric",
    component: MetricView,
    props: true,
  },
  {
    path: "/product/:nm_id",
    name: "product",
    component: ProductView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
