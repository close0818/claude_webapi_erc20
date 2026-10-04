<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MERCHANTS, withdraw, isAddress } from '../api'
import AddressPicker from '../components/AddressPicker.vue'
import CopyText from '../components/CopyText.vue'
import ErrorAlert from '../components/ErrorAlert.vue'

const router = useRouter()
const form = ref({
  merchant_id: 'OP_DEV',
  crypto_type: 'ETH',
  from_address: '',
  to_address: '',
  secret_key: '',
  amount: '',
  memo: ''
})
const showKey = ref(false)
const confirming = ref(false)
const loading = ref(false)
const error = ref(null)
const result = ref(null)
const lastCrypto = ref('ETH')

const problems = computed(() => {
  const f = form.value
  const p = []
  if (!isAddress(f.from_address.trim())) p.push('來源地址格式錯誤')
  if (!isAddress(f.to_address.trim())) p.push('目的地址格式錯誤')
  if (f.from_address.trim().toLowerCase() === f.to_address.trim().toLowerCase() && f.from_address) p.push('來源與目的地址相同')
  if (!/^0x[0-9a-fA-F]{64}$/.test(f.secret_key.trim())) p.push('私鑰需為 0x + 64 位十六進位')
  if (!/^\d+(\.\d+)?$/.test(f.amount.trim()) || Number(f.amount) <= 0) p.push('金額需大於 0')
  if (!f.crypto_type.trim()) p.push('請輸入幣種')
  return p
})

function review() {
  error.value = null
  result.value = null
  if (problems.value.length) {
    error.value = { code: 10401, hint: '請修正:' + problems.value.join('、'), message: '' }
    return
  }
  confirming.value = true
}

async function send() {
  confirming.value = false
  loading.value = true
  const f = form.value
  try {
    result.value = await withdraw({
      merchant_id: f.merchant_id,
      crypto_type: f.crypto_type.trim().toUpperCase(),
      from_address: f.from_address.trim(),
      to_address: f.to_address.trim(),
      secret_key: f.secret_key.trim(),
      amount: f.amount.trim(),
      memo: f.memo
    })
    lastCrypto.value = f.crypto_type.trim().toUpperCase()
    form.value.secret_key = '' // 送出後立即清除私鑰
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

function goTx() {
  router.push({ path: '/tx', query: { hash: result.value.tx_hash, crypto: lastCrypto.value } })
}
</script>

<template>
  <h1>轉帳提幣</h1>
  <p class="sub">POST /v1/withdraw ・ 由後端簽章並廣播到鏈上,送出後無法撤回</p>

  <div class="card">
    <div class="row">
      <div>
        <label>商戶 (merchant_id)</label>
        <select v-model="form.merchant_id">
          <option v-for="m in MERCHANTS" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div>
        <label>幣種 (crypto_type)</label>
        <input v-model="form.crypto_type" placeholder="ETH / USDC" />
      </div>
    </div>

    <label>來源地址 (from_address)</label>
    <input v-model="form.from_address" class="mono" placeholder="0x…" />
    <AddressPicker @pick="form.from_address = $event" />

    <label>目的地址 (to_address)</label>
    <input v-model="form.to_address" class="mono" placeholder="0x…" />
    <AddressPicker @pick="form.to_address = $event" />

    <label>來源地址私鑰 (secret_key)</label>
    <div style="display:flex;gap:8px">
      <input v-model="form.secret_key" class="mono" :type="showKey ? 'text' : 'password'" placeholder="0x + 64 位十六進位" autocomplete="off" />
      <button type="button" @click="showKey = !showKey">{{ showKey ? '隱藏' : '顯示' }}</button>
    </div>
    <div class="hint">私鑰只會送到你的後端用於簽章,不會儲存在瀏覽器;送出後會自動清空。</div>

    <div class="row">
      <div>
        <label>金額 (amount)</label>
        <input v-model="form.amount" placeholder="例如 0.01" inputmode="decimal" />
      </div>
      <div>
        <label>備註 (memo,選填)</label>
        <input v-model="form.memo" />
      </div>
    </div>

    <div class="actions">
      <button class="primary" :disabled="loading" @click="review">{{ loading ? '送出中…' : '檢查並送出' }}</button>
    </div>
    <ErrorAlert :error="error" />
  </div>

  <div v-if="result" class="card">
    <h3>已送出到鏈上</h3>
    <div class="alert ok">交易已廣播,狀態為「待確認」,後端排程約每 5 分鐘掃描一次並於 12 個確認後更新。</div>
    <dl class="kv">
      <dt>交易哈希</dt><dd><CopyText :text="result.tx_hash" /></dd>
      <dt>備註</dt><dd>{{ result.memo || '—' }}</dd>
    </dl>
    <div class="actions"><button @click="goTx">查看此交易狀態 →</button></div>
  </div>

  <div v-if="confirming" class="modal" @click.self="confirming = false">
    <div class="card">
      <h3>確認轉帳</h3>
      <dl class="kv">
        <dt>商戶</dt><dd>{{ form.merchant_id }}</dd>
        <dt>金額</dt><dd><b>{{ form.amount }} {{ form.crypto_type.toUpperCase() }}</b></dd>
        <dt>從</dt><dd class="mono">{{ form.from_address }}</dd>
        <dt>到</dt><dd class="mono">{{ form.to_address }}</dd>
        <dt>備註</dt><dd>{{ form.memo || '—' }}</dd>
      </dl>
      <div class="alert warn">區塊鏈交易送出後無法撤回,請再次確認收款地址。</div>
      <div class="actions">
        <button class="danger" @click="send">確認送出</button>
        <button @click="confirming = false">取消</button>
      </div>
    </div>
  </div>
</template>
