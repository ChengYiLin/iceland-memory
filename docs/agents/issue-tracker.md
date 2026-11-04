# Issue tracker: Local Markdown

本專案的規格與任務使用本機 Markdown，存放於 `.scratch/`。

## 檔案慣例

- 每個功能使用獨立資料夾：`.scratch/<feature-slug>/`。
- 規格：`.scratch/<feature-slug>/spec.md`。
- 實作任務：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，從 `01` 開始，每個任務一個檔案，依相依順序編號。
- `Status:` 欄位放在任務開頭；triage 狀態字串見 [triage-labels.md](triage-labels.md)。
- 相依任務記錄於 `Blocked by:` 欄位。
- 討論與補充依序附加至檔案底部的 `## Comments`。

## 技能操作對應

- 「發布到 issue tracker」：在 `.scratch/<feature-slug>/` 建立對應的 Markdown 檔案及必要資料夾。
- 「讀取任務」：開啟使用者提供的檔案路徑，或在對應功能資料夾中依編號尋找。

## Wayfinding operations

- 決策地圖：`.scratch/<effort>/map.md`，記錄 Notes、Decisions-so-far 與 Fog。
- 子任務：`.scratch/<effort>/issues/NN-<slug>.md`。
- `Type:` 使用 `research`、`prototype`、`grilling` 或 `task`。
- `Blocked by:` 列出相依編號；所有相依任務均為 `resolved` 才能開始。
- 從尚未領取、未解決且沒有阻擋的任務中，優先處理編號最小者。
- 開始前先儲存 `Status: claimed`。
- 解決後新增 `## Answer`、設為 `Status: resolved`，並在地圖的 Decisions-so-far 補上摘要與連結。
