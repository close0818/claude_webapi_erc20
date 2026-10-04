<script setup>
import { ref } from 'vue'
import { getBalance, isAddress } from '../api'
import AddressPicker from '../components/AddressPicker.vue'
import ErrorAlert from '../components/ErrorAlert.vue'

const presets = ['ETH', 'USDC']
const address = ref('')
const crypto = ref('ETH')
const loading = ref(false)
const error = ref(null)
const result = ref(null)
const queried = ref(null)

async function submit() {
  error.value = null
  result.value = null
  if (!isAddress(address.value.trim())) {
    error.value = { code: 10404, hint: '地址格式錯誤(需為 0x 開頭 + 40 位十六進位)', message: '' }
    return
  }
  loading.value = true
  try {
    const a = address.value.trim()
    const c = crypto.value.trim().toUpperCase()
    result.value = await getBalance(a, c)
    queried.value = { address: a, crypto: c, at: new Date().toLocaleString() }
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <h1>查詢餘額</h1>
  <p class="sub">GET /v1/:address/balance/:cryptoType ・ ETH 走原生餘額,其他幣種走合約 balanceOf</p>

  <div class="card">
    <label>錢包地址 (address)</label>
    <input v-model="address" class="mono" placeholder="0x…" @keyup.enter="submit" />
    <AddressPicker @pick="address = $event" />

    <label>幣種 (cryptoType)</label>
    <input v-model="crypto" placeholder="ETH / USDC" @keyup.enter="submit" />
    <div class="chips">
      <span v-for="p in presets" :key="p" class="chip" :class="{ on: crypto === p }" @click="crypto = p">{{ p }}</span>
    </div>
    <div class="hint">非 ETH 的幣種需先存在後端 tokens 表,否則回「不支援的幣種」。</div>

    <div class="actions">
      <button class="primary" :disabled="loading || !address" @click="submit">{{ loading ? '查詢中…' : '查詢' }}</button>
    </div>
    <ErrorAlert :error="error" />
  </div>

  <div v-if="result" class="card">
    <h3>查詢結果</h3>
    <div class="big">{{ result.balance }} <small style="font-size:16px;color:var(--muted)">{{ queried.crypto }}</small></div>
    <div class="hint mono" style="margin-top:8px">{{ queried.address }} ・ {{ queried.at }}</div>
  </div>
</template>
