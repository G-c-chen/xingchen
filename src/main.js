import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { isYqwHost, currentPro, currentType } from "./common/js/utils.js";
import 'lib-flexible/flexible.js'
import "vant/lib/index.css";
import { List, Popup, Toast } from 'vant';
import './common/less/mixin.less';
Vue.use(List);
Vue.use(Popup);
Vue.use(Toast);

const token = '405e7243c1ca7078e84a25b7436d0427';
localStorage.setItem('token', token);
document.title = '星辰网络'

Vue.config.productionTip = false;


new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");
