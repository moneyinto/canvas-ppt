import { createApp } from "vue";
import App from "./App.vue";
import AntDesign from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "./assets/styles/index.scss";
import Icon from "./components/icon.vue";

const app = createApp(App);
app.use(AntDesign);
app.component("PPTIcon", Icon);
app.mount("#app");
