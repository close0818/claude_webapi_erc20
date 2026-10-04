<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { getTx, isTxHash } from '../api'
import CopyText from '../components/CopyText.vue'
import ErrorAlert from '../components/ErrorAlert.vue'

const route = useRoute()
const hash = ref('')
const crypto = ref('ETH')
const loading = ref(false)
const error = ref(null)
const result = ref(null)
const auto = ref(false)
let timer = null

// 後端 define:Status 0 待確認 / 1 成功 / 2 失敗
const STATUS = {
  0: { text: '待確認', cls: 'wait' },
  1: { text: '成功', cls: 'success' },
  2: { text: '失敗', cls: 'fail' }
}

async function query(silent = false) {
  if (!silent) {
    error.value = null
    result.value = null
  }
  if (!isTxHash(hash.value.trim())) {
    error.value = { code: 10401, hint: '交易哈希格式錯誤(0x + 64 位十六進位)', message: '' }
    stopAuto()
    return
  }
  if (!silent) loading.value = true
  try {
    result.value = await getTx(hash.value.trim(), crypto.value.trim().toUpperCase())
    error.value = null
    if (result.value.status !== 0) stopAuto() // 已有結果就不用再輪詢
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function stopAuto() {
  auto.value = false
  clearInterval(timer)
  timer = null
}
function toggleAuto() {
  if (auto.value) return stopAuto()
  auto.value = true
  timer = setInterval(() => query(true), 15000)
}

onMounted(() => {
  if (route.query.hash) {
    hash.value = String(route.query.hash)
    crypto.value = String(route.query.crypto || 'ETH')
    query()
  }
})
onBeforeUnmount(stopAuto)
</script>

<template>
  <h1>交易查詢</h1>
  <p class="sub">GET /v1/tx/:txHash ・ 先查掃描到的交易,查無則回傳提幣單(待確認)</p>

  <div class="card">
    <label>交易哈希 (txHash)</label>
    <input v-model="hash" class="mono" placeholder="0x…(64 位)" @keyup.enter="query()" />
    <label>幣種 (crypto_type)</label>
    <input v-model="crypto" placeholder="ETH / USDC" @keyup.enter="query()" />
    <div class="hint">幣種需與該交易一致,否則回「參數不正確」。</div>
    <div class="actions">
      <button class="primary" :disabled="loading || !hash" @click="query()">{{ loading ? '查詢中…' : '查詢' }}</button>
    </div>
    <ErrorAlert :error="error" />
  </div>

  <div v-if="result" class="card">
    <h3>
      交易明細
      <span class="badge" :class="(STATUS[result.status] || STATUS[0]).cls" style="margin-left:8px">
        {{ (STATUS[result.status] || { text: '未知' }).text }}
      </span>
    </h3>
    <div v-if="result.status === 0" class="alert warn">
      尚在待確認。區塊高度與手續費需等後端排程確認後才會填入。
      <button class="sm" style="margin-left:8px" @click="toggleAuto">{{ auto ? '停止自動刷新' : '每 15 秒自動刷新' }}</button>
    </div>
    <dl class="kv">
      <dt>交易哈希</dt><dd><CopyText :text="result.tx_hash" /></dd>
      <dt>幣種 / 鏈</dt><dd>{{ result.crypto_type }} / {{ result.chain_type }}</dd>
      <dt>金額</dt><dd><b>{{ result.amount }}</b> {{ result.crypto_type }}</dd>
      <dt>來源地址</dt><dd class="mono">{{ result.from_address }}</dd>
      <dt>目的地址</dt><dd class="mono">{{ result.to_address }}</dd>
      <dt>區塊高度</dt><dd>{{ result.block_height || '—' }}</dd>
      <dt>手續費</dt><dd>{{ result.status === 0 ? '—' : `${result.fee} ${result.fee_crypto}` }}</dd>
      <dt>備註</dt><dd>{{ result.memo || '—' }}</dd>
    </dl>
  </div>
</template>
