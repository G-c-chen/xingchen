import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { isYqwHost, currentPro, currentType } from "./common/js/utils.js";
import 'lib-flexible/flexible.js'
import "vant/lib/index.css";
import { List, Popup } from 'vant';
import './common/less/mixin.less';
Vue.use(List);
Vue.use(Popup);

const token = '7f912838fca3cefc09d1302a254e3a53';
localStorage.setItem('token', token);
document.title = '星辰网络'

Vue.config.productionTip = false;


new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");
