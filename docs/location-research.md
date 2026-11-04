# 公開景點參考座標查核

查核日期：2026-10-25。來源為 OpenStreetMap 自有的 Nominatim API，逐筆檢視完整回傳名稱、地區與要素類型；查詢採單執行緒、間隔至少 1.15 秒並快取回應。採用資料的每一列同時保留 OSM 要素連結與產生座標的 Nominatim 查詢連結。

## 使用界線

- 這些是**具名景點的公開代表點**，供示意地圖定位。不是旅人照片 GPS、停車場、集合點、登頂點或真實步行／行車軌跡。
- 湖、海灘、火山、峽谷、國家公園等面或地理要素，回傳代表點可能位於水面、山體或保護區內；網站不得把示意連線稱作可駕駛道路。
- 同名結果須按地區與類型人工排除；例如 Hvítserkur 採海中 islet，不採東部同名山峰；Ingjaldshólskirkja 採教堂，不採同名道路；Vogafjós 採餐廳，不採聯外道路；Gullfoss 採瀑布，不採同名保護區。
- 私人事件、住宿、未具名店家與未明確的拍攝位置維持待確認，不以城市／區域中心補齊。
- 座標順序一律為 `[經度, 緯度]`。以下資料是景點位置依據，不代表旅人已確認實際停留點。

## 已核對的參考點

共 43 個公開景點代表點，可對應 44 段回憶（蝙蝠山兩日重訪保留不同回憶）。

| 回憶識別                           | API 回傳名稱         | 要素類型                 | 經度, 緯度              | 主要來源                                                                                                                                                                                                             |
| ---------------------------------- | -------------------- | ------------------------ | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| day-02-memory-03                   | Hallgrímskirkja      | amenity/place_of_worship | -21.9267103, 64.1417951 | [OSM 要素](https://www.openstreetmap.org/relation/6184378) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Hallgr%C3%ADmskirkja&countrycodes=is&format=jsonv2&limit=3)                               |
| day-02-memory-06                   | Sólfar               | tourism/artwork          | -21.9222615, 64.147607  | [OSM 要素](https://www.openstreetmap.org/node/295480918) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=S%C3%B3lfar&countrycodes=is&format=jsonv2&limit=3)                                          |
| day-03-memory-03                   | Búðakirkja           | amenity/place_of_worship | -23.3840222, 64.821663  | [OSM 要素](https://www.openstreetmap.org/way/289737040) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=B%C3%BA%C3%B0akirkja&countrycodes=is&format=jsonv2&limit=3)                                  |
| day-03-memory-04                   | Vatnshellir          | natural/cave_entrance    | -23.8179815, 64.7481231 | [OSM 要素](https://www.openstreetmap.org/node/2384628206) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Vatnshellir&countrycodes=is&format=jsonv2&limit=3)                                         |
| day-04-memory-01                   | Ingjaldshólskirkja   | amenity/place_of_worship | -23.8523638, 64.9078409 | [OSM 要素](https://www.openstreetmap.org/way/169835197) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Ingjaldsh%C3%B3lskirkja&countrycodes=is&format=jsonv2&limit=3)                               |
| day-04-memory-03                   | Kirkjufellsfoss      | waterway/waterfall       | -23.3123631, 64.92616   | [OSM 要素](https://www.openstreetmap.org/node/4328166327) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Kirkjufellsfoss&countrycodes=is&format=jsonv2&limit=3)                                     |
| day-04-memory-05                   | Hvítserkur           | place/islet              | -20.6352344, 65.6064174 | [OSM 要素](https://www.openstreetmap.org/way/609822851) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Hv%C3%ADtserkur&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-05-memory-03                   | Glaumbær             | tourism/museum           | -19.5046985, 65.6110311 | [OSM 要素](https://www.openstreetmap.org/way/431230441) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Glaumb%C3%A6r&countrycodes=is&format=jsonv2&limit=3)                                         |
| day-06-memory-02                   | Goðafoss             | waterway/waterfall       | -17.550624, 65.6828162  | [OSM 要素](https://www.openstreetmap.org/node/5227736663) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Go%C3%B0afoss&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-06-memory-04                   | Skútustaðagígar      | leisure/nature_reserve   | -17.033733, 65.5713765  | [OSM 要素](https://www.openstreetmap.org/way/411196971) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Sk%C3%BAtusta%C3%B0ag%C3%ADgar&countrycodes=is&format=jsonv2&limit=3)                        |
| day-06-memory-05                   | Vogafjós             | amenity/restaurant       | -16.9225384, 65.6241026 | [OSM 要素](https://www.openstreetmap.org/node/6462407896) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Vogafj%C3%B3s&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-07-memory-02                   | Dettifoss            | waterway/waterfall       | -16.3844911, 65.8143509 | [OSM 要素](https://www.openstreetmap.org/node/571990614) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Dettifoss&countrycodes=is&format=jsonv2&limit=3)                                            |
| day-07-memory-04                   | Ásbyrgi              | place/locality           | -16.5122266, 66.0015884 | [OSM 要素](https://www.openstreetmap.org/node/1397755121) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=%C3%81sbyrgi&countrycodes=is&format=jsonv2&limit=3)                                        |
| day-07-memory-06                   | Jarðböðin við Mývatn | amenity/public_bath      | -16.8475989, 65.6304565 | [OSM 要素](https://www.openstreetmap.org/way/513972196) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=M%C3%BDvatn+Nature+Baths&countrycodes=is&format=jsonv2&limit=3)                              |
| day-08-memory-01                   | Grjótagjá            | natural/cave_entrance    | -16.8829708, 65.6264141 | [OSM 要素](https://www.openstreetmap.org/node/270956562) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Grj%C3%B3tagj%C3%A1&countrycodes=is&format=jsonv2&limit=3)                                  |
| day-08-memory-03                   | Leirhnjúkur          | natural/volcano          | -16.7935408, 65.7212747 | [OSM 要素](https://www.openstreetmap.org/node/2443293303) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Leirhnj%C3%BAkur&countrycodes=is&format=jsonv2&limit=3)                                    |
| day-08-memory-04                   | Hverfjall            | natural/peak             | -16.873954, 65.6050606  | [OSM 要素](https://www.openstreetmap.org/node/270956581) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Hverfjall&countrycodes=is&format=jsonv2&limit=3)                                            |
| day-08-memory-05                   | Dimmuborgir          | natural/bare_rock        | -16.9079361, 65.5880548 | [OSM 要素](https://www.openstreetmap.org/relation/7490898) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Dimmuborgir&countrycodes=is&format=jsonv2&limit=3)                                        |
| day-08-memory-06                   | Hverir               | place/locality           | -16.809182, 65.6411434  | [OSM 要素](https://www.openstreetmap.org/node/3281788218) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Hverir&countrycodes=is&format=jsonv2&limit=3)                                              |
| day-09-memory-01                   | Stuðlagil            | tourism/attraction       | -15.3081247, 65.1623267 | [OSM 要素](https://www.openstreetmap.org/node/4356487496) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Stu%C3%B0lagil&countrycodes=is&format=jsonv2&limit=3)                                      |
| day-09-memory-04                   | Hengifoss            | waterway/waterfall       | -14.8895463, 65.095181  | [OSM 要素](https://www.openstreetmap.org/node/2571686635) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Hengifoss&countrycodes=is&format=jsonv2&limit=3)                                           |
| day-10-memory-02                   | Gufufoss             | waterway/waterfall       | -14.0574988, 65.2399528 | [OSM 要素](https://www.openstreetmap.org/node/3101158567) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Gufufoss&countrycodes=is&format=jsonv2&limit=3)                                            |
| day-11-memory-03, day-12-memory-02 | Vestrahorn           | natural/peak             | -14.94975, 64.27605     | [OSM 要素](https://www.openstreetmap.org/node/8728974717) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Vestrahorn&countrycodes=is&format=jsonv2&limit=3)                                          |
| day-11-memory-04                   | Pakkhús              | amenity/restaurant       | -15.2040242, 64.2501616 | [OSM 要素](https://www.openstreetmap.org/way/193117971) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Pakkh%C3%BAs+H%C3%B6fn&countrycodes=is&format=jsonv2&limit=3)                                |
| day-13-memory-01                   | Jökulsárlón          | water/lagoon             | -16.2274213, 64.0783208 | [OSM 要素](https://www.openstreetmap.org/relation/9044202) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=J%C3%B6kuls%C3%A1rl%C3%B3n&countrycodes=is&format=jsonv2&limit=3)                         |
| day-13-memory-02                   | Breiðamerkursandur   | natural/beach            | -16.178248, 64.0431419  | [OSM 要素](https://www.openstreetmap.org/node/4381268597) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Diamond+Beach&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-13-memory-03                   | Fjallsárlón          | water/lagoon             | -16.3977875, 64.0228952 | [OSM 要素](https://www.openstreetmap.org/relation/10275914) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Fjalls%C3%A1rl%C3%B3n&countrycodes=is&format=jsonv2&limit=3)                             |
| day-13-memory-04                   | Fjaðrárgljúfur       | tourism/attraction       | -18.1737214, 63.7725995 | [OSM 要素](https://www.openstreetmap.org/node/1784678783) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Fja%C3%B0r%C3%A1rglj%C3%BAfur&countrycodes=is&format=jsonv2&limit=3)                       |
| day-13-memory-07                   | Skógafoss            | waterway/waterfall       | -19.511292, 63.5321038  | [OSM 要素](https://www.openstreetmap.org/node/270937065) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Sk%C3%B3gafoss&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-14-memory-01                   | Reynisfjara          | natural/beach            | -19.0587987, 63.4044262 | [OSM 要素](https://www.openstreetmap.org/relation/13989221) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Reynisfjara&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-14-memory-02                   | Seljalandsfoss       | waterway/waterfall       | -19.9881686, 63.6154571 | [OSM 要素](https://www.openstreetmap.org/node/2427040668) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Seljalandsfoss&countrycodes=is&format=jsonv2&limit=3)                                      |
| day-14-memory-03                   | Gljúfrabúi           | waterway/waterfall       | -19.9863395, 63.6207562 | [OSM 要素](https://www.openstreetmap.org/node/2534116947) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Glj%C3%BAfrab%C3%BAi&countrycodes=is&format=jsonv2&limit=3)                                |
| day-14-memory-06                   | Eldheimar            | tourism/museum           | -20.2600939, 63.4349924 | [OSM 要素](https://www.openstreetmap.org/way/363482366) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Eldheimar&countrycodes=is&format=jsonv2&limit=3)                                             |
| day-15-memory-01                   | Bláa lónið           | leisure/resort           | -22.4493538, 63.8800487 | [OSM 要素](https://www.openstreetmap.org/way/69991144) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Blue+Lagoon&countrycodes=is&format=jsonv2&limit=3)                                            |
| day-16-memory-01                   | Þingvellir           | place/locality           | -21.1212537, 64.2590998 | [OSM 要素](https://www.openstreetmap.org/node/316032856) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=%C3%9Eingvellir&countrycodes=is&format=jsonv2&limit=3)                                      |
| day-16-memory-02                   | Brúarfoss            | waterway/waterfall       | -20.5158725, 64.2642354 | [OSM 要素](https://www.openstreetmap.org/node/415505782) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Br%C3%BAarfoss&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-16-memory-03                   | Stóri Geysir         | natural/geyser           | -20.2995104, 64.3138382 | [OSM 要素](https://www.openstreetmap.org/node/60653536) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Geysir&countrycodes=is&format=jsonv2&limit=3)                                                |
| day-16-memory-04                   | Gullfoss             | waterway/waterfall       | -20.1216821, 64.3266103 | [OSM 要素](https://www.openstreetmap.org/node/2051929069) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Gullfoss&countrycodes=is&format=jsonv2&limit=3)                                            |
| day-16-memory-05                   | Friðheimar           | building/greenhouse      | -20.4448425, 64.1772958 | [OSM 要素](https://www.openstreetmap.org/way/436751501) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Fri%C3%B0heimar&countrycodes=is&format=jsonv2&limit=3)                                       |
| day-16-memory-06                   | Lava Show            | tourism/attraction       | -21.942965, 64.1569946  | [OSM 要素](https://www.openstreetmap.org/node/10939878230) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Lava+Show+Reykjav%C3%ADk&countrycodes=is&format=jsonv2&limit=3)                           |
| day-06-memory-01                   | Skógarböðin          | amenity/public_bath      | -18.0417986, 65.6699183 | [OSM 要素](https://www.openstreetmap.org/node/9769774769) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Forest+Lagoon&countrycodes=is&format=jsonv2&limit=5)                                       |
| day-08-memory-02                   | Víti                 | water/lake               | -16.7540289, 65.7172158 | [OSM 要素](https://www.openstreetmap.org/way/113324846) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=V%C3%ADti&countrycodes=is&format=jsonv2&limit=5&viewbox=-17%2C66%2C-16%2C65&bounded=1)       |
| day-09-memory-02                   | Rjúkandi             | waterway/waterfall       | -15.0794796, 65.3335816 | [OSM 要素](https://www.openstreetmap.org/node/2376735338) · [Nominatim 回應](https://nominatim.openstreetmap.org/search?q=Rj%C3%BAkandi&countrycodes=is&format=jsonv2&limit=5&viewbox=-16%2C66%2C-13%2C64&bounded=1) |

## 別名與範圍補充

- Víti 的限區查詢同時回傳 Askja 浴池與 Krafla 火口湖。本次只採北部 Krafla 一帶的 lake 要素；北部觀光官方的 [Víti 介紹](https://www.northiceland.is/en/place/viti)明確說明位於 Krafla 附近，沒有採用南邊 Askja 的同名浴池。
- Forest Lagoon 的 Nominatim 英文名稱查詢回傳 `Skógarböðin`。經營者自己的[冰島語頁面](https://www.forestlagoon.is/is)使用 Skógarböðin 名稱，[英文官方頁面](https://www.forestlagoon.is/)說明位於阿庫雷里對岸的 Eyjafjarðarsveit；本次採 public_bath 要素，不以阿庫雷里市中心代替。
- Mývatn Nature Baths 查詢回傳 `Jarðböðin við Mývatn`。地方觀光官方[米湖溫泉介紹](https://www.visitmyvatn.is/en/see-and-do/myvatn-naturebath)同頁保留 Mývatn Nature Baths 與 Earth Lagoon 名稱，地址 Jarðbaðshólar；旅程原稱呼不因現行品牌名而改寫。
- Lava Show 的[經營者官方網站](https://www.lavashow.com/)列出 Reykjavík 地址 Fiskislóð 73，以及另一個 Vík 地址；本次僅採 Reykjavík 的 OSM attraction，沒有混入 Vík 分館。
- Kirkjufell 與瀑布合為一段回憶的來源項目，本次採 `Kirkjufellsfoss` 瀑布代表點，而不是山頂；實際拍攝點仍待照片線索確認。
- Vestrahorn 採山體公開要素，僅表示景點；暴雨未進場與隔日補訪的位置不因此被視為相同的實際攝影／到訪軌跡。
- Stuðlagil 只採峽谷 attraction，不據此推論旅人從哪一岸、哪個停車場或步道進入。
- Geysir & Strokkur 目前同一回憶，本次採同區的 `Stóri Geysir` 要素作景區參考，不能推論當時噴發的是哪個噴泉。

## 查到但未採用

- Bæjarins Beztu Pylsur：搜尋回傳多個 Reykjavík 分店，缺少實際分店線索；不直接挑第一筆。
- Ytri Tunga：普通查詢回傳北部同名農場及其他道路；限西部後得到停車場、農舍與泛稱 Seal Watching 的觀察點，仍不把其中一筆當作實際海豹拍攝位置。
- Þingeyrakirkja：精確名稱無結果；Þingeyrar 查詢主要得到道路、建築及說明牌，沒有明確的具名教堂要素，不採用。
- Kolugljúfur：回傳的是 information/board，要素不等同實際峽谷或瀑布位置，未採用。
- Sólheimasandur 飛機殘骸：複合查詢無結果；沙地名稱只回傳停車場與廣大沙地，不以沙地中心代替殘骸位置。
- 其餘住宿、畫畫休息站、路邊小馬、私房瀑布、北極狐、求婚、彈跳床、晚宴、香水店、還車與護照事件均未補猜測座標。

## 可重現性

本次原始回應快取位於本機研究暫存檔，採用清單另輸出 `/private/tmp/iceland-verified-locations.json` 供整合。內容清單與程式未由這份研究修改。未採用項目可以後續依照片位置、地址或旅人確認補齊。

資料來源授權：[OpenStreetMap copyright / ODbL](https://www.openstreetmap.org/copyright)。網站仍需保留底圖與資料署名。

## 旅人提供的 Google 地點（2026-10-25）

以下地點由旅人直接提供連結。座標取自 Google Maps 轉址目的地的 `!3d緯度!4d經度` 地點資料，而不是 `@緯度,經度` 的地圖鏡頭中心；內容仍以 `[經度, 緯度]` 儲存。保留共同短文與回憶名稱，只更新正式地點名稱、位置狀態、座標及來源。

| 回憶識別         | 旅行日／回憶   | 連結中的正式地點      | 經度, 緯度              | 旅人提供來源                                             |
| ---------------- | -------------- | --------------------- | ----------------------- | -------------------------------------------------------- |
| day-02-memory-02 | Day 2 冰淇淋店 | Ísbúðin litla Valdís  | -21.9255345, 64.1446917 | [Google Maps](https://maps.app.goo.gl/42QUGD3EYgpSGcHy5) |
| day-03-memory-01 | Day 3 漢堡店   | Dirty Burger And Ribs | -21.908728, 64.5436153  | [Google Maps](https://maps.app.goo.gl/2efeE6AFW3H7CBhK6) |
| day-05-memory-05 | Day 5 藍色教堂 | Hofsóskirkja          | -19.4073277, 65.8958723 | [Google Maps](https://maps.app.goo.gl/RGuCrBB6mNmKvqVi6) |

熱狗店的[旅人分享連結](https://share.google/XXgQTg2l4tXg2znTz)轉向 Bæjarins Beztu Pylsur 的 Google 搜尋地點（`kgmid=/g/12hsmwdjb`），目前讀取內容未提供分店地址或座標。[店家官網](https://bbp.is/)有多間分店，Tryggvagata 的官網地圖連結提供 `[-21.937986, 64.1482785]`，但尚未確認是否與旅人分享的是同一分店，因此暫不採用，保留位置待確認。

## Google Maps 共享清單套用（2026-10-25）

旅人授權依[「冰島遊」共享清單](https://maps.app.goo.gl/CF2dkaPcN7LvcK638)更新預覽。重新讀取共有 13 個地點，取得 13 筆資料；採用其中 10 個地點，對應 11 段既有回憶，沒有依清單排序重排旅行日。座標來自清單各地點資料，非地圖鏡頭中心。

新增可定位回憶：Day 4 巨人之淚峽谷、Day 14 西人島黑木教堂。其餘 9 段更新參考座標或來源。所有套用回憶的 `coordinateSource` 保留共享清單連結，下表保存各地點連結與本次座標快照。

| 回憶識別         | 清單地點       | 經度, 緯度              | 個別來源                                                            |
| ---------------- | -------------- | ----------------------- | ------------------------------------------------------------------- |
| day-04-memory-03 | 教會山         | -23.3069444, 64.9416667 | [Google 地點](https://www.google.com/maps?cid=699284608376757115)   |
| day-04-memory-04 | 巨人峽谷       | -20.5712958, 65.3333817 | [Google 地點](https://www.google.com/maps?cid=6382356607847974190)  |
| day-04-memory-05 | 犀牛石         | -20.6352441, 65.6063761 | [Google 地點](https://www.google.com/maps?cid=3925282366974911996)  |
| day-05-memory-05 | Hofsóskirkja   | -19.4073277, 65.8958723 | [Google 地點](https://www.google.com/maps?cid=7661619937271543952)  |
| day-11-memory-03 | Vestrahorn     | -15.0086112, 64.2733333 | [Google 地點](https://www.google.com/maps?cid=7654853059851838444)  |
| day-12-memory-02 | Vestrahorn     | -15.0086112, 64.2733333 | [Google 地點](https://www.google.com/maps?cid=7654853059851838444)  |
| day-14-memory-01 | 黑沙灘         | -19.0716193, 63.4057404 | [Google 地點](https://www.google.com/maps?cid=16175052599839648725) |
| day-14-memory-02 | Seljalandsfoss | -19.9886113, 63.6155997 | [Google 地點](https://www.google.com/maps?cid=5094567140323765829)  |
| day-14-memory-03 | Gljúfrabúi     | -19.9864486, 63.6208631 | [Google 地點](https://www.google.com/maps?cid=10838569697353686830) |
| day-14-memory-06 | Eldheimar      | -20.2602696, 63.4349245 | [Google 地點](https://www.google.com/maps?cid=6219204254274294895)  |
| day-14-memory-07 | Stafkirkjan    | -20.2613481, 63.4443356 | [Google 地點](https://www.google.com/maps?cid=2647148004918628888)  |

- 教會山對應既有「教堂山與教堂山瀑布」回憶，採旅人所存山體參考位置，不表示實際登頂或瀑布拍攝位置。
- 蝙蝠山兩日回憶保持獨立；共同參考點不表示 Day 11 暴雨時已進場，或兩天停車／拍攝位置相同。
- Eldfell：尚未確認是否為 Day 14 實際登上的山，保留原回憶位置待確認。
- Vík i Myrdal Church：原行程只記錄 Vík 補給，不將教堂自動當成補給位置或新增到訪。
- Blönduóskirkja：尚未確認造訪，不新增回憶或替代其他教堂。

## 旅人指定的小馬位置（2026-10-25）

Day 4「巧遇冰島小馬」（`day-04-memory-02`）依旅人直接指定的[Google Maps 街景連結](https://www.google.com/maps/@64.9375359,-23.3568645,13a,75y,247.55h,94.75t/data=!3m10!1e1!3m8!1slRVuq_jYjXHJAwOzgQ3p7g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.clients6.google.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-4.749794654540381%26panoid%3DlRVuq_jYjXHJAwOzgQ3p7g%26yaw%3D247.5519945754965!7i16384!8i8192!9m2!1b1!2i34?authuser=0&entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D)補上 `[-23.3568645, 64.9375359]`，並改為已確認位置。這次使用網址中的街景視點座標作為旅人指定參考點，未從畫面猜測馬匹位置，也沒有據此建立實際行車軌跡。完整原始連結保留於 `coordinateSource`。

## Day 2 旅人更正（2026-10-25）

- `day-02-memory-01` 改為「抵達凱夫拉維克機場（KEF）」，移除原名稱及共同短文中的 04:00、入境與提車描述。依[旅人提供的機場地點](https://maps.app.goo.gl/Wqih9Sw9MCkNF5xX8)，設定 `[-22.6281862, 63.9814869]` 並標為已確認位置。
- `day-02-memory-05` 由市政廳／托寧湖改為「Harpa 音樂廳」，名稱、位置線索與共同短文同步更新。旅人輸入 Hapa，[提供連結](https://maps.app.goo.gl/vJecWfA7tTCTczUX6)對應哈帕音樂廳，採正式拼法 Harpa；設定 `[-21.9322804, 64.1502464]` 並標為已確認位置。
- 移除 `day-02-memory-07`（New Modern 3BR 公寓）整段回憶，Day 2 剩 6 段。其餘回憶順序與識別保持不變。
- 座標採 Google Maps 轉址網址的 `!3d緯度!4d經度` 地點資料，不使用 `@` 鏡頭中心。

## Day 3 旅人更正（2026-10-25）

- `day-03-memory-02`（Ytri Tunga 海豹沙灘）依[旅人提供連結](https://maps.app.goo.gl/6CcL3Y5qcf6b7zWx7)設定 `[-23.0803177, 64.8027417]` 並標為已確認位置。本次採旅人明確選定的 Ytri Tunga 地點，未推論實際拍攝海豹的位置。
- `day-03-memory-05` 改名為「冰島守護神公園」，依[旅人提供連結](https://maps.app.goo.gl/ps9Qd9t32YVvt2298)設定 `[-23.6271264, 64.7656497]` 並標為已確認位置。連結對應 Monument to the Bard of Snæfellsás，正式位置線索保留 Bárður Snæfellsás 與 Arnarstapi。
- 座標採 Google Maps 轉址網址的 `!3d緯度!4d經度` 地點資料，不使用 `@` 鏡頭中心；其餘 Day 3 回憶與順序保持不變。

## Day 3–5 旅人更正（2026-10-25）

- 「恩揚德斯霍爾教堂」回憶（`day-04-memory-01`）改名為「視力眼小紅屋」，保留正式地名、位置與原行程 Day 4；旅人此次寫在 Day 3 下，未明確要求調整旅行日。
- 移除 Day 5 金縷教堂（`day-05-memory-02`）與霍夫索斯海景泳池（`day-05-memory-06`），其餘回憶順序與識別保持不變。
- Day 5 亞庫來利採旅人指定的城市參考點，不表示 Acco Luxury Apartments 的精確位置；住宿與綿羊回憶共用 Laxás Cottage 的旅人指定參考位置。
- Day 5 小鎮連結對應 Herring Café，採店家位置作為該段既有小鎮／用餐回憶的參考點。騎小馬連結對應 Hestasport Reception，作為騎馬回憶的參考位置，不表示實際騎乘軌跡。

| 回憶識別         | 位置線索                                         | 經度, 緯度              | 旅人提供來源                                             |
| ---------------- | ------------------------------------------------ | ----------------------- | -------------------------------------------------------- |
| day-03-memory-06 | Hotel Vest Mar                                   | -23.706937, 64.8954128  | [Google Maps](https://maps.app.goo.gl/qGzKs4eMMB2ReQaJ7) |
| day-04-memory-06 | Laxás Cottage（Blönduós）                        | -20.2986914, 65.6200923 | [Google Maps](https://maps.app.goo.gl/1AFK4bDEPeD91CCbA) |
| day-05-memory-01 | Laxás Cottage 周邊                               | -20.2986914, 65.6200923 | [Google Maps](https://maps.app.goo.gl/1AFK4bDEPeD91CCbA) |
| day-05-memory-03 | Glaumbær Turf Farm & Museum                      | -19.5043888, 65.6103973 | [Google Maps](https://maps.app.goo.gl/fhRnwgGp31cMwF89A) |
| day-05-memory-04 | Hestasport Reception - Cottages and Riding Tours | -19.4390034, 65.5456096 | [Google Maps](https://maps.app.goo.gl/ayrGwLxndjrJ11Gg8) |
| day-05-memory-07 | Herring Café（Siglufjörður）                     | -18.9136382, 66.1476101 | [Google Maps](https://maps.app.goo.gl/ufHF2r7DCLtV91pV6) |
| day-05-memory-08 | 亞庫來利（Akureyri）                             | -18.0906859, 65.6825509 | [Google Maps](https://maps.app.goo.gl/iNjLgfZ919HLfhZz7) |

以上座標採 Google Maps 轉址網址的 `!3d緯度!4d經度` 地點資料。Day 6 這次尚無更正內容，維持原資料。

## Day 6–8 旅人更正（2026-10-25）

- Day 6「收拾行李」改為「Forest Lagoon」，共同短文移除收拾行李描述。移除「前往米湖區」與第一次極光回憶點。
- Day 7 移除好友會合回憶；胡薩維克移除「上金」，依旅人指定木造教堂定位。
- Day 6–8 同名 Mývatn apartments 住宿同步使用旅人指定的公寓位置，保留各日獨立回憶。

| 回憶識別         | 經度, 緯度              | 旅人提供來源                                             |
| ---------------- | ----------------------- | -------------------------------------------------------- |
| day-06-memory-01 | -18.0420694, 65.6700871 | [Google Maps](https://maps.app.goo.gl/bm3gWaUV4TnFoTnv9) |
| day-07-memory-05 | -17.3421909, 66.0458796 | [Google Maps](https://maps.app.goo.gl/rcHrjAp7F1CXZLKZ7) |
| day-08-memory-03 | -16.7842628, 65.7184813 | [Google Maps](https://maps.app.goo.gl/yRSq7dB8W6zXT1Cv5) |
| day-08-memory-05 | -16.91228, 65.5912203   | [Google Maps](https://maps.app.goo.gl/7Uo8oPh3JmQTcJFm7) |
| day-08-memory-06 | -16.809311, 65.6409144  | [Google Maps](https://maps.app.goo.gl/7J5K8Dd4ESRcA1wk6) |
| day-06-memory-06 | -16.8960741, 65.6207036 | [Google Maps](https://maps.app.goo.gl/bsbfPwEXcsadb6Kd9) |
| day-07-memory-07 | -16.8960741, 65.6207036 | [Google Maps](https://maps.app.goo.gl/bsbfPwEXcsadb6Kd9) |
| day-08-memory-07 | -16.8960741, 65.6207036 | [Google Maps](https://maps.app.goo.gl/bsbfPwEXcsadb6Kd9) |

### 公路休息站的暫估位置

旅人明確要求以黛提瀑布與馬蹄峽谷兩點間的中點定位 `day-07-memory-03`。使用目前兩地參考座標 `[-16.3844911, 65.8143509]` 與 `[-16.5122266, 66.0015884]`，逐軸算術平均、保留 7 位小數，得到 `[-16.4483589, 65.9079697]`。這是地理座標中點，不是道路里程中點，也不是已查證的休息站。

回憶名稱、位置線索與共同短文明確標示暫估；為讓既有地圖顯示，沿用 `confirmed` 的可繪圖狀態，不能據此視為實際到訪位置已確認。未附上會暗示找到真實休息站的來源連結。其他 Google Maps 座標採轉址目的地的 `!3d緯度!4d經度` 地點資料。
