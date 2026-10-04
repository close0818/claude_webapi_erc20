<script setup>
import { ref } from 'vue'
import { MERCHANTS, createAddress, saveAddress } from '../api'
import CopyText from '../components/CopyText.vue'
import ErrorAlert from '../components/ErrorAlert.vue'

const merchant = ref('OP_DEV')
const loading = ref(false)
const error = ref(null)
const result = ref(null)

async function submit() {
  loading.value = true
  error.value = null
  result.value = null
  try {
    result.value = await createAddress({ merchant_id: merchant.value })
    saveAddress(result.value.address, merchant.value)
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <h1>建立錢包</h1>
  <p class="sub">POST /v1/address ・ 產生新的 ETH 地址,並登錄到指定商戶</p>

  <div class="card">
    <label>商戶 (merchant_id)</label>
    <select v-model="merchant">
      <option v-for="m in MERCHANTS" :key="m" :value="m">{{ m }}</option>
    </select>
    <label>鏈 (chain_type)</label>
    <input value="ETH" disabled />
    <div class="actions">
      <button class="primary" :disabled="loading" @click="submit">{{ loading ? '建立中…' : '建立錢包' }}</button>
    </div>
    <ErrorAlert :error="error" />
  </div>

  <div v-if="result" class="card">
    <h3>建立成功</h3>
    <div class="alert warn">
      私鑰只會顯示這一次,伺服器不會保存。請立即複製並妥善保管;本頁不會把私鑰存在瀏覽器。
    </div>
    <dl class="kv">
      <dt>地址</dt><dd><CopyText :text="result.address" /></dd>
      <dt>私鑰</dt><dd><CopyText :text="result.secret_key" /></dd>
      <dt>公鑰</dt><dd><CopyText :text="result.public_key" /></dd>
    </dl>
    <div class="hint" style="margin-top:12px">地址已加入本機「我的地址」,可在其他頁面快速選取。</div>
  </div>
</template>
