import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { isYqwHost, currentPro, currentType } from "./common/js/utils.js";
import 'lib-flexible/flexible.js'
import { List, Popup } from 'vant';
import './common/less/mixin.less';
Vue.use(List);
Vue.use(Popup);

const token = '2f1f67dc8129f61cff03af8a2a8095ce';
localStorage.setItem('token', token);

Vue.config.productionTip = false;

window.BJ_REPORT.init({
    id: 27, // project_code
    uin: "nuanliuguanwang", // 用户标识
    url: "https://error.youjyi.cn/api/errrorlog/receive", // 上报url
    random: 1, // 抽样上报
    offlineLog: false, // 是否离线上报
    onReport() {
        // 上报回调
    },
});


new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");
