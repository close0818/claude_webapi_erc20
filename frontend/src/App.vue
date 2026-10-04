<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const nav = [
  { to: '/address', icon: '＋', label: '建立錢包', api: 'POST /v1/address' },
  { to: '/balance', icon: '¤', label: '查詢餘額', api: 'GET /v1/:address/balance/:crypto' },
  { to: '/withdraw', icon: '↗', label: '轉帳提幣', api: 'POST /v1/withdraw' },
  { to: '/tx', icon: '☰', label: '交易查詢', api: 'GET /v1/tx/:txHash' }
]
</script>

<template>
  <div class="layout">
    <aside>
      <div class="brand">ERC20 錢包<small>管理後台</small></div>
      <nav>
        <router-link v-for="n in nav" :key="n.to" :to="n.to" :class="{ on: route.path === n.to }">
          <span class="ic">{{ n.icon }}</span>
          <span><b>{{ n.label }}</b><em>{{ n.api }}</em></span>
        </router-link>
      </nav>
    </aside>
    <main><router-view /></main>
  </div>
</template>

<style scoped>
.layout{display:grid;grid-template-columns:260px 1fr;min-height:100vh}
aside{background:var(--card);border-right:1px solid var(--line);padding:20px 12px;position:sticky;top:0;height:100vh}
.brand{font-weight:700;font-size:18px;padding:0 10px 16px}
.brand small{display:block;font-weight:400;font-size:12px;color:var(--muted)}
nav{display:flex;flex-direction:column;gap:4px}
nav a{display:flex;gap:10px;align-items:center;padding:9px 10px;border-radius:8px;color:var(--text);text-decoration:none}
nav a:hover{background:var(--code)}
nav a.on{background:var(--accent);color:#fff}
nav a.on em{color:rgba(255,255,255,.8)}
.ic{width:24px;text-align:center;font-size:18px}
nav b{display:block;font-size:14px}
nav em{display:block;font-style:normal;font-size:11px;color:var(--muted);font-family:Consolas,monospace}
main{padding:28px;max-width:860px;width:100%}
@media(max-width:760px){
  .layout{grid-template-columns:1fr}
  aside{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}
  nav{flex-direction:row;overflow-x:auto}
  nav em{display:none}
  main{padding:16px}
}
</style>
