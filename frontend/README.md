# webapi_erc20 前端 (Vue 3 + Vite)

對應後端 4 支 API 的操作介面。

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

- 開發時 `/v1/*` 會由 Vite proxy 轉發到 `http://127.0.0.1:8888`(後端沒有開 CORS)。
  後端在別的位置時: `VITE_API_TARGET=http://host:port npm run dev`
- 正式部署請用 `npm run build`,再由 nginx 等反向代理 `/v1` 到後端。

| 頁面 | 路由 | 後端 API |
|---|---|---|
| 建立錢包 | `/address` | `POST /v1/address` |
| 查詢餘額 | `/balance` | `GET /v1/:address/balance/:cryptoType` |
| 轉帳提幣 | `/withdraw` | `POST /v1/withdraw` |
| 交易查詢 | `/tx` | `GET /v1/tx/:txHash` |

注意: 本機只會在 localStorage 記錄「地址」(方便選取),**不會**儲存私鑰。
