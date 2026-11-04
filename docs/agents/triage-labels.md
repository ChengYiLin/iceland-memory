# Triage Labels

五種 canonical triage role 與本機任務的狀態字串如下。

| Canonical role    | 本機狀態字串      | 意義                        |
| ----------------- | ----------------- | --------------------------- |
| `needs-triage`    | `needs-triage`    | 等待維護者評估              |
| `needs-info`      | `needs-info`      | 等待補充資訊                |
| `ready-for-agent` | `ready-for-agent` | 規格充分，可交由 agent 執行 |
| `ready-for-human` | `ready-for-human` | 需要由人實作                |
| `wontfix`         | `wontfix`         | 決定不處理                  |

技能提到 triage role 時，使用上表的狀態字串。本機 Markdown 任務以 `Status:` 欄位記錄。
