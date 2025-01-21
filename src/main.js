import { createApp } from "vue";
import App from "./App.vue";
import axios from "./axios.js";
import qs from "qs";
import router from "./router";

//Bootstrap
import "bootstrap/dist/css/bootstrap.css";
//import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.js";

const app = createApp(App);
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$qs = qs;
app.use(router);
app.mount("#app");
