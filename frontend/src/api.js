// 後端統一回應格式: { status: { code, messages }, data }
// 注意: 後端錯誤時 HTTP 也是 400,所以不論 HTTP 狀態都要解析 body

export const CHAIN_TYPE = 'ETH'
export const MERCHANTS = ['OP_DEV', 'OP_PRE', 'OP', 'QA']

export const ERROR_HINT = {
  10400: '伺服器內部錯誤',
  10401: '參數不正確',
  10402: '餘額不足',
  10403: '查無此交易',
  10404: '地址格式錯誤(需為 0x 開頭 + 40 位十六進位)',
  10405: '不支援的幣種(tokens 表查無此幣)'
}

export class ApiError extends Error {
  constructor(code, messages) {
    super(messages)
    this.code = code
    this.hint = ERROR_HINT[code] || ''
  }
}

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
  } catch (e) {
    throw new ApiError(0, '無法連線到後端,請確認後端服務已啟動 (預設 :8888)')
  }

  let body
  try {
    body = await res.json()
  } catch (e) {
    throw new ApiError(res.status, `回應格式錯誤 (HTTP ${res.status})`)
  }

  if (!body.status || body.status.code !== 200) {
    const s = body.status || {}
    throw new ApiError(s.code || res.status, s.messages || body.error || '未知錯誤')
  }
  return body.data
}

// POST /v1/address
export function createAddress({ merchant_id }) {
  return request('/v1/address', {
    method: 'POST',
    body: JSON.stringify({ merchant_id, chain_type: CHAIN_TYPE })
  })
}

// GET /v1/:address/balance/:cryptoType?chain_type=ETH
export function getBalance(address, cryptoType) {
  const url = `/v1/${encodeURIComponent(address)}/balance/${encodeURIComponent(cryptoType)}?chain_type=${CHAIN_TYPE}`
  return request(url)
}

// POST /v1/withdraw  (amount 以字串送出,避免浮點誤差)
export function withdraw(payload) {
  return request('/v1/withdraw', {
    method: 'POST',
    body: JSON.stringify({ ...payload, chain_type: CHAIN_TYPE })
  })
}

// GET /v1/tx/:txHash?crypto_type=&chain_type=ETH
export function getTx(txHash, cryptoType) {
  const url = `/v1/tx/${encodeURIComponent(txHash)}?crypto_type=${encodeURIComponent(cryptoType)}&chain_type=${CHAIN_TYPE}`
  return request(url)
}

// 本機位址簿 (只存地址,不存私鑰)
const KEY = 'erc20.addresses'
export function loadAddresses() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch (e) {
    return []
  }
}
export function saveAddress(address, merchant) {
  try {
    const list = loadAddresses().filter(a => a.address !== address)
    list.unshift({ address, merchant, at: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)))
  } catch (e) {}
}
export function removeAddress(address) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadAddresses().filter(a => a.address !== address)))
  } catch (e) {}
}

export const isAddress = v => /^0x[0-9a-fA-F]{40}$/.test(v || '')
export const isTxHash = v => /^0x[0-9a-fA-F]{64}$/.test(v || '')
