import { createApp } from "vue";
import App from "./App.vue";
import "virtual:svg-icons-register";
import AntDesign, { message } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "./assets/styles/index.scss";
import "./console";

const app = createApp(App);
app.use(AntDesign);
app.mount("#app");

message.config({
    maxCount: 1
});
