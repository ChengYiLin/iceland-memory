# Iceland Memory · 冰島，沿途的我們

以地圖串起冰島 18 天旅程的旅行回憶，包含去回程與轉機。選擇一天後，鏡頭移動、路線延伸、回憶點逐一亮起；播放結束停留探索，點回憶展開依順序排列的精選照片與故事。

旅人更新的完整行程見 [18 天真實行程紀錄](docs/itinerary.md)，日期為 2026/09/23–2026/10/10；正式觀看介面已載入這份文字行程，歷史原型中的兩天仍保留為示範。

正式需求與驗收條件見[冰島 18 天回憶網站與本機內容整理工具規格](.scratch/memory-experience/spec.md)，已標記 `ready-for-agent`。規格涵蓋本機整理照片與故事、產生展示圖片並匯出純靜態網站，目前技術功能已接入，完整內容驗收仍待真實素材。

已確認的拆分見[10 張正式實作任務與執行順序](.scratch/iceland-memory-release/README.md)，實作進度與驗證證據記錄於各張任務。

目前已接上正式 A 觀看介面與 18 天、109 段文字回憶。本機工具可整理故事、批次加入與壓縮照片、排序選封面及匯出靜態成品；已補上 44 段回憶的公開景點參考位置；真實照片與其餘不明位置仍待補齊，尚未公開部署。

直接操作請看[本機整理室、匯出方式與待補清單](docs/local-editor.md)。執行 `npm run editor` 後，開啟 <http://127.0.0.1:5181/editor.html>。

## 本機啟動

使用 `.nvmrc` 的 Node 22.23.2，或符合 `package.json` engines 的版本。

```sh
nvm use
npm ci
npm run dev
```

安裝已完成時可以直接執行 `npm run dev`。若安裝時遇到 npm 10 的 peer dependency 解析錯誤，可使用 `npx npm@11 ci`；本專案鎖定檔由 npm 11 產生。

地圖預設使用 OpenFreeMap Positron，可複製 `.env.example` 為 `.env.local` 修改底圖樣式。地圖需要網路與 WebGL；載入失敗時仍可從日期及回憶清單看故事。`VITE_` 開頭的設定會公開在瀏覽器，僅放公開設定。

## 開發指令

```sh
npm run build          # 型別檢查與正式建置
npm run check          # 型別、lint、單元測試、格式檢查
npm run format         # 格式化原始碼與文件
npm run perf:map        # 先啟動正式建置預覽，再量測初始化
npx playwright install chromium
npm run test:e2e       # 桌面與手機 Chromium，會自行啟動本機伺服器
```

瀏覽器測試固定使用本機 5173 埠，執行前請先關閉同埠的開發伺服器。測試以簡單底圖隔離外部圖資服務，同時保留真實 WebGL 與動畫；真實底圖另行確認。

## 內容入口

- `content/journey.json`：首次使用的真實文字行程，18 天共 109 段回憶；精確位置待確認。
- `.local-memory/journey.json`：本機工具已儲存的內容；工具重開時優先讀取這份資料。
- `.local-memory/originals/` 與 `.local-memory/media/`：私人匯入原檔及產生的展示圖。
- `.local-memory/export/`：可獨立預覽與部署的靜態成品，只有明確公開欄位與被引用的展示圖。
- `src/features/viewer/`：正式全螢幕地圖、照片故事與導覽。
- `src/editor/` 與 `scripts/editor.mjs`：只在本機使用的整理介面與檔案操作服務。

第一張照片作為該回憶點的代表照片；照片順序就是故事順序。原始收藏保留私人，網站只放精選展示版本。`npm run dev` 讀取初始文字行程；查看本機已儲存內容請使用 `npm run editor` 的觀看入口。

完整的技術選擇、資料模型、照片流程與後續工作見 [技術架構](docs/architecture.md)。
