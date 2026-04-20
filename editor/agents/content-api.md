# Editor — Content API

瀏覽器與 `src/content/` 之間的 IO 層。`vite-plugin-content-api.ts` 掛在 Vite
dev server 上，把 `../src/content/` 當固定 workspace 開出 `/__editor/*`
小型 JSON / binary API；`src/lib/io/fs-access.ts` 是 client 端的 fetch wrapper。

middleware 只在 `vite dev` / `vite preview` 啟用；production build 沒有 server。

## Endpoints

| method | route               | 用途                                         |
|--------|---------------------|----------------------------------------------|
| GET    | `/tree`             | 回 workspace 的遞迴 tree（忽略 node_modules 等）|
| GET    | `/file?path=`       | 讀檔；Content-Type 依副檔名（image/*、text/plain）|
| PUT    | `/file?path=`       | 覆寫；Windows 上遇 EBUSY/EPERM 會退避重試再 unlink+write |
| POST   | `/file?path=`       | create-only，檔案已存在回 409                |
| DELETE | `/file?path=`       | 刪檔                                         |
| POST   | `/dir?path=`        | 建資料夾                                     |
| DELETE | `/dir?path=`        | 遞迴刪資料夾                                 |
| PATCH  | `/rename?from=&to=` | 移動 / 改名                                  |

路徑語意：所有 path 都是相對 workspace 的 forward-slash 字串
（e.g. `posts/why-astro/article.svx`），不是絕對 OS 路徑。`safeResolve`
拒絕任何 `..` 越界。

## Windows file-lock handling

Vite 的 `enhanced-img` plugin 會對快取過的圖檔（典型：`cover.jpg`）握著
Windows 的 read lock，導致原地覆寫失敗（EBUSY / EPERM / UNKNOWN）。
`writeFileResilient` 先退避重試幾次（25/60/120ms），全部失敗後
`unlink` + 新寫入 — unlink 可以在 read-locked 的 inode 上成功，舊 handle
會繼續指向 orphaned inode，新 inode 不受鎖影響。

一般純文字儲存走第一次 syscall 就成功，不會跑到 fallback。

## Sync-from-disk（editor:fs events）

同一個 middleware 訂閱 `server.watcher`（chokidar）並把 `src/content/` 底下的
`add / change / unlink / addDir / unlinkDir` 事件以 HMR custom event
(`editor:fs`) 推給 renderer。`App.svelte` 接收後：

- `change` 事件：若該檔案已開啟且 buffer 不 dirty，重讀 disk 內容；
  若是 `posts/*/article.svx`，順便 invalidate post metadata cache 讓 sidebar
  標題更新
- `add` / `unlink` / 目錄事件：debounce 150ms 後 `refreshTree()`

Dirty buffer 不會被外部變更覆寫，避免吃掉未存的本地修改。

事件只透過 Vite 的 HMR WebSocket 發送，所以 production build 沒有 sync。

## Client API（`src/lib/io/fs-access.ts`）

工作區路徑都用 forward-slash 相對字串：

| export              | wraps                           |
|---------------------|---------------------------------|
| `readTree()`        | GET `/tree`                     |
| `readFileRel(p)`    | GET `/file?path=…`（UTF-8 text）|
| `writeFileRel(p,s)` | PUT `/file?path=…`              |
| `createFileRel(p)`  | POST `/file?path=…`             |
| `deleteFileRel(p)`  | DELETE `/file?path=…`           |
| `createDirRel(p)`   | POST `/dir?path=…`              |
| `deleteDirRel(p)`   | DELETE `/dir?path=…`            |
| `renamePathRel(f,t)`| PATCH `/rename?from=&to=…`      |
| `uploadFileRel(p,b)`| PUT `/file?path=…`（binary blob）|
| `assetUrlFor(p)`    | ＝ `/__editor/file?path=…`（直接餵 `<img src>`） |
