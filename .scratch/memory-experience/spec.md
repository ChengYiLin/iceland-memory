Status: ready-for-agent
Created: 2026-10-24

# 冰島 18 天回憶網站與本機內容整理工具

## Problem Statement

你與旅伴希望把 2026/09/23–2026/10/10 的 18 天旅程，整理成能一起重看、分享給親友的旅行回憶。需要留下的不只是景點，還有求婚、生氣、極光、動物偶遇、桌遊與護照事件等專屬故事。

目前已有體驗收斂的 A 原型，但一般首頁仍是舊骨架，只有兩天示範資料、插畫與示意路線。真實行程已有文字紀錄，照片預計下週補齊；若直接改程式與逐張處理圖片，整理各回憶的照片、封面、順序及共同短文會很不方便。

這是一次性製作，完成後不規劃額外維護，希望網站盡量維持每月零元。線上內容後台、雲端資料庫與動態圖片處理會增加不必要的成本與持續運行需求。

## Solution

製作一個以最新版 A 為觀看基準的正式回憶網站，以及只在自己電腦運行的內容整理工具。

旅人在本機瀏覽器中，依旅行日與回憶點編輯故事、匯入照片、安排順序與指定代表照片；工具將內容實際存成本機檔案，自動產生網站用縮圖與瀏覽圖。完成後先預覽正式成品，再匯出完整靜態網站部署。原始照片、草稿與編輯服務留在本機，公開網站只包含故事與精選展示版本。

觀看者從全螢幕冰島地圖選一天，短過場後自由探索，手動翻閱照片及閱讀共同短文。完整保留 18 天，每個實際行程項目都有可開啟的回憶；航程透過故事卡呈現，地圖維持冰島視野。缺照片或未確認位置的回憶仍可從當日清單閱讀。

跨日重疊採規格預設方案「總覽選天，當天看回憶」：同區入口先選旅行日，選定後只顯示當天內容；同一地點的跨日故事各自保留。這是先前提出、此階段採用的實作基準，尚未以完整真實資料驗證。

## User Stories

### 觀看完整旅程

1. As a visitor, I want to see all 18 travel days with their dates, so that I can follow the journey from departure to returning home.
2. As a visitor, I want to choose a day from floating controls on a full-screen map, so that I can explore without losing map space.
3. As a visitor, I want to move to the previous or next day, so that I can follow the trip in order.
4. As a visitor, I want a brief camera and route transition before free exploration, so that I understand the day's setting without waiting through a slideshow.
5. As a visitor, I want to open any memory during the transition, so that I can immediately explore what interests me.
6. As a visitor, I want rapid day changes to finish on my latest selection, so that old animations do not show the wrong memories.
7. As a visitor, I want clearly labeled illustrative routes, so that I do not mistake connecting lines for actual driving tracks.
8. As a visitor, I want flights and transfers presented as story cards, so that I can read the complete journey while the map stays around Iceland.
9. As a visitor, I want every actual itinerary item to have an openable memory, so that meals, accommodation and small events remain part of the story.
10. As a visitor, I want unsuccessful visits and later revisits to remain distinct, so that the site's story matches what happened.
11. As a visitor, I want a daily memory list, so that I can open stories whose locations are unknown or whose markers are hard to select.
12. As a visitor, I want stories to remain readable when the basemap fails, so that map availability does not prevent me from viewing the memories.

### 辨識地點與跨日重疊

13. As a visitor, I want overlapping day entrances grouped by area, so that the overview remains readable in places visited repeatedly.
14. As a visitor, I want an area menu showing day numbers, dates and titles, so that I can choose the visit I remember.
15. As a visitor, I want only the selected day's route and memories displayed, so that stories from different visits do not become mixed together.
16. As a visitor, I want memories at the same location to retain separate identities, so that I can distinguish different moments there.
17. As a visitor, I want nearby markers separated and same-location memories selectable from a list, so that every memory remains reachable.
18. As a desktop visitor, I want thumbnail markers with names and locations on hover or focus, so that I can recognize a memory before opening it.
19. As a mobile visitor, I want one compact preview at a time, so that I can identify a memory without covering the map with cards.
20. As a visitor, I want the camera to stay stable when switching days in the same area, so that exploring repeated visits feels continuous.

### 照片與共同短文

21. As a visitor, I want to view one complete photo at a time, so that both portrait and landscape photos remain understandable.
22. As a visitor, I want touch swiping, mouse dragging and photo navigation controls, so that I can browse comfortably on my device.
23. As a visitor, I want a visible photo count and no automatic photo playback, so that I control the reading pace.
24. As a visitor, I want swipes and arrow keys to stay within the current memory, so that I do not accidentally leave its story.
25. As a visitor, I want explicit controls for the previous and next memory, so that changing stories is intentional.
26. As a visitor, I want a memory containing one photo to work correctly, so that short memories receive the same care as larger photo sets.
27. As a visitor, I want the story entrance visible as soon as a memory opens, so that I notice the shared writing.
28. As a visitor, I want to expand the story inside a fixed-size album, so that the close button and surrounding layout stay stable.
29. As a visitor, I want the shared writing and optional individual remarks kept together, so that both travelers' perspectives can be preserved.
30. As a visitor, I want closing the album to preserve the day and map position, so that I can continue exploring from the same place.
31. As a visitor, I want missing photos and failed image loads handled clearly, so that I can still read and navigate the story.
32. As a keyboard user, I want labeled controls, usable focus and Escape to close the album, so that I can explore without a pointer.
33. As a visitor sensitive to motion, I want transitions to respect reduced-motion preferences, so that I can read comfortably.
34. As a mobile visitor, I want the controls, story entrance and close button usable on a small screen, so that I can read without horizontal overflow.

### 本機整理與保存

35. As a traveler, I want to launch a local browser-based editor, so that I can prepare the site without operating a cloud backend.
36. As a traveler, I want the real itinerary already organized by day and memory, so that I can focus on adding photos and stories.
37. As a traveler, I want to edit memory names, location clues, shared writing and individual remarks, so that the content uses our own words.
38. As a traveler, I want to correct known coordinates or leave a location unconfirmed, so that the site does not invent where a memory happened.
39. As a traveler, I want to import several local photos into a chosen memory, so that I can organize the collection efficiently.
40. As a traveler, I want to reorder photos and choose a representative photo, so that the album follows our intended narrative.
41. As a traveler, I want to add photo descriptions and captions, so that the images retain their context.
42. As a traveler, I want edits saved as local files and restored after reopening the tool, so that closing the browser does not lose our work.
43. As a traveler, I want stories without photos to remain editable and previewable, so that preparation can begin before the collection is complete.
44. As a traveler, I want importing and removing display photos to preserve the originals, so that preparing the website does not damage our source collection.
45. As a traveler, I want automatic thumbnail and browsing-image generation, so that I do not have to resize each photo manually.
46. As a traveler, I want orientation and public-image metadata handled during processing, so that display images look correct and contain only intended information.
47. As a traveler, I want unsupported or damaged images reported with the affected files identified, so that I can resolve them without losing other imports.
48. As a traveler, I want export checks for missing assets and deployment limits, so that broken references and oversized outputs are caught before publication.
49. As a traveler, I want to preview the actual static output, so that I can verify the same site that visitors will receive.
50. As a traveler, I want an export containing only public site assets, so that originals, drafts and editing services stay on my computer.
51. As a traveler, I want the exported site to work after shutting down the local editor, so that viewing it never depends on my computer being online.
52. As a traveler, I want to retain originals, saved content and the final export, so that the finished work can be preserved without an ongoing content service.
53. As a traveler, I want a documented deployment process using free static hosting, so that completing this one-time project does not require a paid backend.
54. As a visitor, I want a basic shareable link to a day or memory, so that I can return to a particular part of the journey.

## Implementation Decisions

### 正式觀看體驗

- 沿用既有 Vue、TypeScript、Vite 與 MapLibre 基礎，將最新版 A 的行為整合至一般首頁與正式建置。原型比較入口、B／C 舊方案及除錯面板不作為正式產品內容。
- 全螢幕地圖上提供浮動的總覽、旅行日選單及前後一天控制；第一天與最後一天的日切換按鈕在相應方向停用，不循環跳轉。
- 原型已驗證的基準是鏡頭約 650 毫秒、示意路線約 1,850 毫秒，隨後自由探索，不自動逐站展示或開故事。這是體驗目標，不以毫秒級計時斷言驗收。
- 過場中開啟故事即完成當日路線，停止該次過場；關閉後自由探索。切換旅行日需取消舊動畫、預覽與故事狀態，舊事件不得覆蓋新一天。
- 同區換天且目前視野足以容納新一天時保留鏡頭；否則重新定位。航程、無位置內容與空路線不觸發全球鏡頭或無意義動畫。零個或一個可用座標時仍可閱讀故事，不建立虛構線段。
- 跨日重疊的預設方案：總覽按區域彙整旅行日入口，標示不同旅行日的數量；同一天多個點在該區域只計一次。同一天可從不同區域進入。區域成員由內容中的明確關聯決定，區域名稱與入口位置不能用來冒充回憶的精確座標。
- 區域入口打開日期排序的選單，顯示旅行日編號、日期與標題；桌機使用輕量浮動選單，手機使用可關閉的底部面板。選日後只顯示該日標記與示意路線。純航程與無區域的旅行日仍可由完整日期選單選取。
- 同日相近標記沿用原型的避讓及位置連線，鏡頭移動時清除舊連線、定位後重算；同座標多段回憶使用可選清單，不合併內容或任意改動真實位置。
- 桌機標記使用封面與序號，hover／focus 顯示名稱及正式地名，點擊開故事；手機使用圓形縮圖，首次點擊打開一張預覽，再點預覽或同一標記開故事。一次只有一張預覽，換天清除。
- 當日清單可在不依賴地圖完成載入的情況下選取每段故事；底圖失敗、缺座標與標記密集都不能造成內容無法開啟。清單使用按需展開的控制，不以常駐大面板壓縮地圖。
- 基本分享連結以穩定旅行日／回憶識別還原選取狀態，採靜態託管可支援的網址方式。無效識別回到可操作的總覽或當日清單，不能導致空白頁。
- 保留必要圖資署名；手機預設收合仍可展開。地圖使用外部圖資是已知依賴，不承諾完全離線瀏覽或永久外部服務可用性。

### 相簿與邊界

- 第一張照片就是代表照片；本機選定封面時將該照片移到第一張，保留其他照片的相對順序，避免兩套封面與排序規則互相矛盾。
- 相簿每次顯示一張完整照片，支援直橫幅。觸控與觸控板採橫向瀏覽，桌機可滑鼠拖曳，保留箭頭按鈕與左右方向鍵；滑動與方向鍵只在同段照片內移動，邊界停留。
- 控制維持單列：中間張為上一張／下一張；第一張左側前往上一段最後一張，當天第一段則停用；末張右側前往下一段第一張，當天最後一段則關閉。跨回憶由明確按鈕觸發，只限當天，不自動跨天。
- 單張照片同時套用首張與末張規則。零張照片顯示待補照片與故事，不顯示錯誤張數；保留可用的上一段／下一段或關閉控制。跨入零照片回憶時打開文字狀態，不產生負數照片索引。
- 翻照片使用淺色描邊圓角、單箭頭；跨回憶使用深綠實心、較方外觀、雙箭頭與明確文字，同時以形狀與標籤區分操作。
- 相簿外框依視窗設定固定尺寸並保留邊界；標題、× 關閉及故事入口固定可見，內容在內部捲動。暖色故事入口露出第一句與閱讀提示，展開共同短文及可選的個別補充時外框與關閉按鈕不移位。
- 關閉故事保留旅行日、地圖位置與當日路線；不恢復舊版自動導覽。保留 Escape、焦點約束、關閉後焦點回到可用入口及可辨識的控制標籤；輸入文字時不以方向鍵觸發照片或日期切換。
- 減少動態效果偏好直接顯示可探索狀態。圖片載入失敗顯示可辨識狀態，故事、關閉與前後導覽仍可用。按需要載入瀏覽圖，不在首頁一次下載整趟旅程的全部大圖。

### 內容契約與真實行程

- 內容模型沿用「旅程 → 旅行日 → 回憶點 → 精選照片組」。每層使用穩定識別，與陣列索引、顯示序號及原始檔名分離；重新排序與轉檔不應破壞照片關聯或分享連結。
- 18 天日期與順序固定對應 2026/09/23–2026/10/10，原型兩天的虛構編號與內容不作為真實行程來源。實際行程紀錄中的景點、餐廳、住宿、途中事件與航程均需可追溯至回憶。
- 有子項目的群組需保留各實際經歷的獨立可開啟入口，例如求婚、彈跳床、彩虹街道，而非只保留整天或小鎮一個合併故事。純分類標題與取消更正不重複建立到訪回憶。
- 回憶保留名稱、正式地名或位置線索、共同短文、可選個別補充、照片順序及地點狀態。地理位置可為已確認座標、待確認或不在冰島地圖呈現的航程；不再要求每段回憶必有座標及路線索引。
- 位置採經度在前、緯度在後；有效範圍與必填欄位需檢查。使用者可在本機修正座標或標為待確認，不因店名或附近地標自行填入猜測位置。位置確認與後續具名地點查核可逐步完成。
- 每日路線只按使用者提供的行程順序連接可用的冰島位置，標示「示意連線，非實際駕車軌跡」；若有待定位項目，在當日清單標出，不把已知點之間的線誤認為完整實際路線。航程不加入跨國地圖線段。
- 同地跨日使用不同回憶識別，例如暴雨未進場與隔日再訪成功；取消珍珠樓、未去黑沙灘等只保留為更正說明，不能產生已到訪標記。
- 未提供的故事細節、照片、座標、餐廳或冰川名稱皆明確待補，不以示範插畫或虛構敘事冒充真實內容。故事與圖片未齊不阻擋編輯與預覽。
- 本機內容檔與公開內容使用可驗證、可轉換的契約，公開照片以可攜的靜態網址參照。公開內容不包含電腦絕對路徑、私人原檔位置或僅供編輯的欄位。

### 本機內容整理工具

- 新增本機瀏覽器介面與本機檔案服務，與觀看網站共用內容契約、圖片規則及預覽所需的正式觀看能力；不建立另一套旅程資料模型。服務只監聽 loopback，工作目錄由工具設定，所有寫檔限定在允許的內容與媒體目錄，拒絕不受信任來源的寫入及路徑逃逸。
- 介面以旅行日與回憶點選取為主，可編輯回憶名稱、位置線索、座標狀態、共同短文及個別補充，批次加入照片、調整順序、指定封面、編輯替代文字與照片說明、移除展示關聯。
- 工具提供明確儲存及成功／失敗狀態，未儲存修改在離開時提醒。儲存後重新開啟工具仍能恢復文字、座標、排序與圖片關聯；瀏覽器儲存空間不作為唯一資料來源。
- 匯入、保存與匯出的介面以完整操作為單位：輸入選定回憶、照片或內容變更，回傳已保存內容、處理進度及具體錯誤；不讓瀏覽器直接任意讀寫整台電腦。
- 原始照片私下保存，不修改或覆寫原檔。移除展示照片只改網站使用的關聯，不刪除使用者原始收藏。內容儲存與輸出採失敗時可保留上一份有效版本的方式。
- 本機完成圖片方向修正、縮放、壓縮、尺寸讀取與縮圖產生，移除展示檔不需要的 EXIF／位置中繼資料；網站真正需要的文字、時間與位置明確寫在內容中。
- 初始輸出基準採縮圖長邊約 480 px、瀏覽圖長邊約 1,920 px，等比例縮放、小圖不強制放大；品質以真實夜景、人像及直橫幅照片驗證後調整，不將壓縮到固定檔案大小視為唯一成功標準。
- 第一版至少支援 JPEG、PNG 與 WebP 靜態照片匯入並產生瀏覽器可用的展示圖；其他格式先在匯入時清楚告知不支援。HEIC、RAW、Live Photo 與影片不作未驗證的支援承諾，取得真實素材後有需要再調整範圍。
- 批次作業回報各檔案結果，損壞或不支援檔案不破壞其他已保存資料。相同來源重新處理不應造成無限制重複輸出，封面與順序不能因轉檔改變。
- 本機工具的桌面瀏覽器操作為第一版目標，不要求手機編輯、桌面應用程式安裝包或多人同步。提供啟動、儲存、預覽與匯出說明即可完成本次整理。

### 靜態成品、部署與交付

- 匯出從已保存內容產生；有未儲存修改時要求先保存或清楚提示使用哪個版本。原始素材、內容檔與公開輸出分開保存，匯出不覆蓋私人收藏。
- 匯出前檢查內容契約、重複識別、失效圖片參照、輸出檔案數與單檔大小。結構錯誤、遺失被引用的展示圖及超出部署限制會阻擋匯出，錯誤需指明旅行日／回憶／檔案；主動留空的照片或位置是可預覽的待補狀態，不與損壞參照混淆。
- 工具顯示缺照片、缺位置及待補文字清單。技術功能可在素材未齊前交付；最終內容驗收需確認每個預定故事節點至少一張真實照片，或由旅人明確接受該節點保留待補狀態。
- 正式預覽直接讀取可部署的靜態成品，不依賴編輯服務提供故事或圖片；本機工具停止後，成品仍能經一般靜態伺服器開啟。不是要求直接雙擊檔案或完全離線載入外部底圖。
- 公開輸出只包含觀看所需的網頁、靜態內容、精選圖片與其他必要資產；排除原始照片、草稿、編輯介面、本機服務及私人機器資訊，瀏覽器不得請求本機編輯 API。
- 以 Cloudflare 免費靜態託管與提供的免費網站網址作部署基準，網站與精選照片一起發布。圖片處理在本機完成，本次不依賴 R2、Images、雲端資料庫或付費 Worker 方案。
- 成本目標為每月 US$0；部署前核對當時免費規則、檔案數與大小。免費額度與按量超額計費服務分開看待，不自動啟用付費服務或將免費額度宣稱為永久零元保證。
- 匯出與部署是兩個步驟。交付可重現的匯出、靜態預覽、部署與最終成品保存說明；網站觀看不需保持本機工具或 Node 執行。保存原檔、已存內容與最終靜態成品，一次性完成後沒有常駐內容服務或排程同步。

## Testing Decisions

### 主要驗收入口

以一條最高層的完整流程作主要驗收：在隔離的本機工作目錄啟動工具，匯入代表性照片、編輯共同短文與位置狀態、排列照片及指定封面，儲存後關閉再重開，匯出正式成品，停止編輯服務，再由一般靜態伺服器透過瀏覽器觀看。

這條流程同時驗證檔案持久化、圖片處理、內容轉換與正式觀看，避免為每個內部函式新增測試入口。測試入口已透過技能要求的核對問題送給使用者；目前採此建議作規格基準，不把尚未回覆視為明示確認，也不阻擋規格發布。

### 可觀察的成功條件

1. 儲存後重開可還原回憶文字、照片順序、代表照片與待確認位置；關閉瀏覽器不造成資料遺失。
2. 原檔內容在匯入、移除展示關聯及重複匯出前後保持不變；展示圖可解碼、方向正確、尺寸符合規則且不包含不需要的公開位置中繼資料。不以有損圖片的精確位元組或內部呼叫次數作斷言。
3. 正式成品中的圖片與內容參照均存在，能在編輯服務停止後讀取；確認輸出與網路請求均無編輯介面、原始照片或 localhost API 依賴。
4. 18 天編號、日期與真實行程來源一致；每個實際行程項目有回憶入口，取消更正無到訪標記，重訪故事不合併。每日項目對照由內容檢查與旅人檢視共同確認，不用固定虛構站數驗收。
5. 涵蓋有多張照片、只有一張、零張、直幅、橫幅、長故事、圖片失敗與待確認位置；例子使用小型可公開測試素材，真實私人照片不放入測試資料庫或測試報告。
6. 區域入口正確計算不同旅行日；跨日相同位置及同日同座標多故事皆可選。從區域、完整日期選單及當日清單得到一致的故事與日期。
7. 桌機與手機均能選日、開故事、翻照片、明確跨回憶、展開文字與關閉；照片／方向鍵在邊界停留，前一段到末張、下一段到首張，最後一段末張可關閉，零照片回憶不破壞導覽。
8. 長文字展開前後相簿外框與關閉按鈕保持穩定；故事入口首次開啟即可見。小尺寸手機沒有水平溢出，標記與固定控制仍可操作。
9. 快速換天取消舊過場與手機預覽，最終顯示最後選擇；開關故事不重設地圖。減少動態效果直接進入可探索狀態；航程日不移動至世界各地。
10. 底圖尚未完成載入或完全失敗時，完整日期選單、當日清單與故事仍可用。圖片失敗不阻擋文字、關閉與前後導覽；有效分享連結可還原回憶，無效連結有可操作退路。
11. 儲存／圖片處理／匯出失敗有明確受影響項目，上一份有效內容與成品不被破壞；缺檔、錯誤座標、重複識別與部署限制可用小型測試資料觸發，不需真的上傳大量圖片。
12. 公開前以真實照片手動檢視夜景、人物、直橫幅與手機載入體驗；最終靜態網址完成基本觀看確認。技術測試通過不等於尚未補齊的真實素材已經驗收。

### 沿用現有測試與必要補充

- 沿用現有 Vitest 旅程狀態測試，涵蓋選日、拒絕不屬於當天的回憶與關閉後保留狀態；僅補有獨立失敗價值的邊界，不測 Vue 內部實作。
- 沿用現有路線測試對距離、邊界、空路線與靜止路線的驗證，不重寫一套相同測試。
- 沿用 Playwright 桌面及手機 Chromium 專案、保留真實 MapLibre WebGL 的簡化底圖攔截策略。現有測試仍針對舊示範首頁及照片展開模式，需依正式版的外部行為更新，不能把舊斷言通過當作新版相簿驗收。
- 新增測試能力集中在本機工具完整操作與靜態成品邊界；內容驗證、儲存與圖片處理透過這個公開操作流程測試。只有高層流程難以穩定覆蓋的失敗情境才補較小的整合測試，不建立平行狀態容器或大量內部 mock。
- 自動測試隔離外部底圖可用性；真實外部底圖、真實手機手感與真實照片另行檢視。型別、lint、既有必要單元測試、正式建置及格式檢查為實作階段的基本檢查。

## Out of Scope

- 線上內容後台、雲端圖片上傳、線上資料庫、觀看者帳號、多人即時協作與跨裝置內容同步。
- R2、Cloudflare Images、付費圖片 CDN、付費 Worker 與新購自訂網域；任何新增付費服務需另外評估成本。
- GPX 匯入、道路匹配、還原真實駕車／渡輪／健行軌跡、即時導航與旅遊規劃功能。
- Google 相簿 API 串接、全收藏自動同步及把私人相簿連結當長期圖片網址。
- 自動撰寫或推測回憶、以猜測座標補齊缺漏、以示範圖片冒充實際照片。
- 自動逐站導覽、照片自動輪播、滑動自動跨回憶、回憶自動跨天，以及 B／C 舊版布局。
- 跨整趟旅程的照片搜尋與回憶名稱索引、逐故事搜尋引擎頁面、SSR、動態社群分享圖及多語系。
- 手機內容編輯、原生桌面應用程式包裝、一鍵登入部署與工具內保存雲端帳號憑證。
- HEIC／RAW／Live Photo／影片的全面支援，專業修圖、人臉辨識、自動選片與影像生成。
- 完整離線底圖封存、外部服務永久可用保證、上線後的持續內容營運與額外維護。

## Further Notes

- 需求來源為本次對話的已確認決策、[領域語彙](../../CONTEXT.md)、[完整真實行程](../../docs/itinerary.md)、[體驗決策地圖](map.md) 與[最新版 A 原型說明](../../src/features/journey/prototype/README.md)。正式行為衝突時以本規格及後續明確修訂為準；原型中的早期自動播放敘述與虛構內容不作真實需求。
- 現有實作有可用的旅程狀態與路線測試，但仍只有兩天示範；本機編輯、媒體處理、靜態匯出與完整 18 天尚未完成。本規格的發布不代表功能已實作或素材已驗收。
- 跨日重疊與本機工具採本對話最後整理的預設方案。其餘具體的模組名稱、圖片函式庫、工作目錄與端點可在實作時選擇，需符合本規格的可觀察行為，不再另開需求訪談。
- 素材待補包括冰淇淋店、畫畫休息站、私房瀑布、冰川健行位置、西人島山名、小飛機位置、晚宴餐廳及護照事件細節等；完整清單以真實行程紀錄維護。這些不阻擋規格與功能實作，但不得因為待補就刪除故事入口。
- 先以一個真實旅行日完成「本機整理到正式觀看」的完整切片，再擴展至全部 18 天；之後由任務拆分階段明列阻擋關係。本次只發布規格，尚未建立正式實作任務。
- Cloudflare 免費方案及限制已在本次對話查核，部署時仍需重新核對當時規則。一次性靜態交付可免去常駐內容服務，但託管與外部底圖依然是網站運行的外部條件。
