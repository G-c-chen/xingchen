import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            component: () => import('./views/Index.vue'),
            meta: {
                title: '首页',
            },
            // children: [
            //     {
            //         path: '/',
            //         name: 'home',
            //         component: () => import('./views/Home.vue'),
            //     },
            // ],
        },
        // {
        //     path: '/yyb',
        //     component: () => import('./views/YYB.vue'),
        //     meta: {
        //         title: '应用宝',
        //     },
        // },
        // {
        //     path: '/50qudao',
        //     component: () => import('./views/Qudao50.vue'),
        //     meta: {
        //         title: '50渠道',
        //     },
        // },
    ],
})