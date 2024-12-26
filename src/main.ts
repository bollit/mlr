import { createApp } from "vue";
import router from "/@/router";
import "./styles/style.less";
import App from "./App.vue";
import * as echarts from "echarts";
// import Antd from 'ant-design-vue';

const app = createApp(App);
app.config.globalProperties.$echarts = echarts;
app.use(router).mount("#app");
// app.use(Antd).mount('#app');
