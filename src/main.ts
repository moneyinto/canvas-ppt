import { createApp } from "vue";
import App from "./App.vue";
import AntDesign, { message } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "./assets/styles/index.scss";
import mwhiteboard from "mwhiteboard";

const app = createApp(App);
app.component("MWhiteboard", mwhiteboard);
app.use(AntDesign);
app.mount("#app");

message.config({
    maxCount: 1
});
