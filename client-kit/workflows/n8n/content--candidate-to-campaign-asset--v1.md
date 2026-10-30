# content--candidate-to-campaign-asset--v1

把 `channel != seo` 的已批准候选生成 SEM / 社媒素材，写入 `deliverables`
（`kind` 为 `sem_landing` 或 `social_post`，`status=ready`），结构化结果放在
`payload`，运行结果写入 `runs`。

## 前置条件

- Directus 已应用最新快照（`candidates.channel` 字段存在）。
- 候选 `status = approved`，且 `channel` 为 `sem_google` / `social_meta` /
  `social_linkedin` / `social_generic`。
- `tenants.enabled = true`，`locale`、`market`、`brand_voice` 已填。
- SEO 文章/产品走另一条流程（`content--candidate-to-deliverable`，只取
  `channel=seo`），两条流程不会重复处理同一候选。

## 凭据

| 凭据名称 | 类型 | 使用节点 |
| --- | --- | --- |
| `Directus Automation Token` | Header Auth | 拉取候选、查重、写入交付物与 `runs` |
| `AI API Key` | Header Auth | `AI generate` |

## Config

| 字段 | 说明 |
| --- | --- |
| `directusUrl` | Directus 根地址，不带 `/items` |
| `aiEndpoint` | OpenAI 兼容的 chat completions 地址 |
| `aiModel` | 模型名，例如 `gpt-4.1-mini` |
| `siteBaseUrl` | 客户站点根地址，用于拼接落地页与 UTM |
| `batchLimit` | 单次拉取的候选上限，默认 30 |

## 流程

```text
手动测试 / 每 30 分钟
  → 拉取 approved 且 channel != seo 的候选
  → 归一化：kind / platform / external_key / UTM
  → 逐条查重（external_key）
      ├─ 已存在 → 跳过
      └─ 不存在 → 按渠道拼提示词 → AI 返回 JSON
                    → 校验并组装 payload → 创建 deliverable（ready）
                    → 写 runs（success）
  任一步失败 → 写 runs（failed）
```

## 渠道映射

| channel | kind | platform | AI 输出结构 |
| --- | --- | --- | --- |
| `sem_google` | `sem_landing` | `google_ads` | `ad_group`、`headlines`（8-15 条，≤30 字符）、`descriptions`（3-4 条，≤90 字符）、`keywords`、`final_path`、`sitelinks` |
| `social_meta` | `social_post` | `meta` | `caption`、`hashtags`、`link_path`、`image_prompt`、`scheduled_at` |
| `social_linkedin` | `social_post` | `linkedin` | 同上，语气偏专业，hashtags 3-5 |
| `social_generic` | `social_post` | `generic` | 同上，caption 更短，便于中转方适配 |

写入 `deliverables.payload` 时统一附带 `utm`：`utm_source=platform`、
`utm_medium=cpc|social`、`utm_campaign=<tenant.slug>-<query slug>`。SEM 的
`final_url` 与社媒的 `link_url` 已拼接 UTM。

## 幂等与失败

- 幂等键：`tenant.slug:kind:candidate.external_id`，与文章流程区分（kind 不同）。
- `runs.execution_id` 唯一，实际写入 `${$execution.id}:${candidateId}`（成功时用交付物 id），
  避免同一次执行处理多个候选时互相冲突。
- AI 返回不是 JSON、缺少必要字段（`headlines`/`descriptions` 或 `caption`）时，
  本次记为失败，候选保持 `approved`，修复后重跑即可。
- 失败不会写入 `deliverables`，`deliverables` 也不会出现半成品。

## 验证方法

1. 在 Directus 把一条 `channel=sem_google` 的候选改为 `approved`。
2. n8n 点击“手动测试”。
3. 检查 `deliverables`：新增 `kind=sem_landing`、`status=ready`，`payload` 含
   `headlines`、`descriptions`、`keywords`、`final_url`。
4. 检查 `runs`：`status=success`，`payload_summary.platform=google_ads`。
5. 再次执行，确认不重复创建。

## 已知边界

- 不创建广告账户、广告组或投放；只产出素材。
- 落地页路径由 AI 建议，必须在 Directus 人工审核后再进入投递流程。
- 不校验字符数上限，审核时需检查 headlines ≤30、descriptions ≤90。
- 图片只给 `image_prompt`，不生成图片，也不上传素材库。
