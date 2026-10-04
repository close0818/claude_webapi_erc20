import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import AddressCreate from './views/AddressCreate.vue'
import Balance from './views/Balance.vue'
import Withdraw from './views/Withdraw.vue'
import TxQuery from './views/TxQuery.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/address' },
    { path: '/address', component: AddressCreate, meta: { title: '建立錢包' } },
    { path: '/balance', component: Balance, meta: { title: '查詢餘額' } },
    { path: '/withdraw', component: Withdraw, meta: { title: '轉帳提幣' } },
    { path: '/tx', component: TxQuery, meta: { title: '交易查詢' } }
  ]
})

createApp(App).use(router).mount('#app')
