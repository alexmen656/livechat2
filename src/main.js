import { createApp } from "vue";
import App from "./App.vue";
import axios from "./axios.js";
import qs from "qs";
import router from "./router";

const app = createApp(App);
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$qs = qs;
app.use(router);
app.mount("#app");
