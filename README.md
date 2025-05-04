# PurchaseBoardManager

## 專案簡介

PurchaseBoardManager 是一套採購需求管理系統，前端採用 React + Vite，後端以 Express 搭配 TypeScript 實作，資料結構以 Drizzle ORM 定義，支援 PostgreSQL 資料庫。

---

## 快速開始

### 1. 環境需求
- Node.js 18 以上
- npm 或 yarn
- PostgreSQL 資料庫（預設支援 Neon serverless，亦可自架）

### 2. 安裝依賴
```bash
npm install
```

### 3. 設定環境變數
請於專案根目錄建立 `.env` 檔案，內容如下：
```
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
```

### 4. 初始化資料庫
```bash
npm run db:push
```

### 5. 建立前端靜態檔案
```bash
npm run build
```

### 6. 啟動伺服器
- 開發模式：
  ```bash
  npm run dev
  ```
- 正式模式：
  ```bash
  npm start
  ```

伺服器預設監聽於 `http://localhost:5000`。

---

## 專案結構
- 前端原始碼：[client/src](client/src)
- 後端 API 與伺服器：[server](server)
- 共用型別與 schema：[shared/schema.ts](shared/schema.ts)

---

## 維護與備份

### 資料庫備份
- 本系統預設使用 PostgreSQL，請定期備份資料庫。
- 可使用 `pg_dump` 工具進行備份，例如：
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```
- 若使用 Neon serverless，請參考官方文件進行快照備份。

### 升級依賴
- 建議定期執行 `npm outdated` 檢查套件版本，並以 `npm update` 升級。
- 若有 TypeScript 或 Drizzle ORM schema 變更，請同步執行 `npm run db:push`。

### 常見問題
- **啟動時找不到 build 目錄**：請先執行 `npm run build`。
- **資料庫連線失敗**：請確認 `.env` 設定與資料庫服務狀態。
- **開發模式無法熱更新**：請確認 Vite 相關依賴已安裝且 Node 版本正確。

---

## CI/CD 與自動化測試

### 建議的 CI/CD 流程
- 建議使用 GitHub Actions 進行自動化建置與測試。
- 可於 `.github/workflows/ci.yml` 建立如下範例：

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: testdb
        ports: [5432:5432]
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    env:
      DATABASE_URL: postgresql://user:password@localhost:5432/testdb
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm run db:push
      - run: npm run build
      - run: npm test
```

### 自動化測試
- 建議撰寫單元測試與整合測試，可使用 [Jest](https://jestjs.io/) 或 [Vitest](https://vitest.dev/)。
- 於 `package.json` 新增測試指令，例如：
  ```json
  "scripts": {
    // ...
    "test": "vitest run"
  }
  ```
- 測試檔案可放於 `client/src/__tests__` 或 `server/__tests__` 目錄。
- 執行測試：
  ```bash
  npm test
  ```

---

## WebSocket 即時同步範例

### 1. 後端（Node.js + ws 套件）

於 `server/index.ts` 加入 WebSocket 支援：

```ts
import { WebSocketServer } from "ws";

// ...原有 Express 相關程式碼...

const server = app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "welcome", message: "WebSocket 連線成功" }));

  // 當有資料異動時，主動推播給所有連線用戶
  // 例如：
  // wss.clients.forEach(client => {
  //   if (client.readyState === ws.OPEN) {
  //     client.send(JSON.stringify({ type: "update", data: ... }));
  //   }
  // });
});
```

### 2. 前端/行動端（JavaScript 範例）

```js
const ws = new WebSocket("wss://your-server.com");

ws.onopen = () => {
  console.log("WebSocket 已連線");
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "update") {
    // 重新取得最新資料或直接更新畫面
    // fetch('/api/xxx') 或 setState(msg.data)
  }
};
```

---

## 行動端 API 呼叫建議

- 建議使用 [axios](https://axios-http.com/) 或原生 fetch 於行動端呼叫 REST API。
- 例：

```js
// 取得所有採購需求
fetch('https://your-server.com/api/requests')
  .then(res => res.json())
  .then(data => {
    // 顯示資料
  });

// 新增採購需求
fetch('https://your-server.com/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'xxx', description: 'yyy', requester: 'zzz' })
});
```

- 行動端可搭配 WebSocket 實現即時通知，或定時呼叫 API 取得最新資料。

---

## 行動端（iOS/Android）部署與即時資料同步

若需讓 iOS 或 Android 用戶端皆可即時看到最新資料，請注意以下部署與設計建議：

### 1. 後端 API 部署
- 請將本專案後端（Express API）部署於雲端伺服器，確保所有行動裝置皆可透過網際網路存取。
- 推薦雲端平台：
  - [Render](https://render.com/)、[Heroku](https://heroku.com/)、[Vercel](https://vercel.com/)、[AWS EC2](https://aws.amazon.com/ec2/)、[GCP Cloud Run](https://cloud.google.com/run)
- 請確保伺服器開放 5000 port 或自訂 port，並設定防火牆允許外部連線。

### 2. 資料庫部署
- 建議使用雲端 PostgreSQL 服務（如 [Neon](https://neon.tech/)、[Supabase](https://supabase.com/)、[AWS RDS](https://aws.amazon.com/rds/)、[GCP Cloud SQL](https://cloud.google.com/sql)）。
- 雲端資料庫可確保多裝置同時存取與資料即時同步。
- 請勿將資料庫部署於僅本地可存取的環境。

### 3. API 設計建議
- 行動端應透過 HTTPS 連線至雲端 API，取得與更新資料。
- 請於行動端定期輪詢（polling）API 或實作 WebSocket 以獲得即時更新。
- 若需高即時性，建議於後端加上 WebSocket 支援，讓前端/行動端可即時收到資料變動通知。

### 4. 資料一致性
- 所有用戶端皆透過同一組 API 與雲端資料庫互動，確保資料一致與即時。
- 若有離線需求，建議於行動端實作本地快取，並於連線恢復時自動同步。

---

## 其他
- 如需自訂部署路徑或 port，請修改 `server/index.ts` 及相關設定。
- 若需進行自動化備份，建議撰寫定時任務（如 crontab）執行備份指令。

---

如有任何問題，歡迎提出 issue 或聯絡專案維護者。 