# content--campaign-asset-to-channel--v1

把 `status = approved` 的 SEM / 社媒交付物，通过 Webhook 中转投递到对应渠道
（Google Ads / Meta / LinkedIn / 通用），成功写回 `payload.delivery` 与
`status=pushed`，运行结果写入 `runs`。

## 前置条件

- 交付物 `kind` 为 `social_post` 或 `sem_landing`，`status = approved`。
- `payload` 已由生成流程写入，且包含 `platform`。
- 存在一个接收素材的中转地址：Zapier、Make、自建服务均可。
- 中转方按 `Idempotency-Key` 去重（推荐直接用它作为外部主键）。

## 凭据

| 凭据名称 | 类型 | 使用节点 |
| --- | --- | --- |
| `Directus Automation Token` | Header Auth | 拉取、Claim、写回、`runs` |
| `Webhook Relay Token` | Header Auth | `Push to webhook` |

`Webhook Relay Token` 的 Header 由中转方决定，常见为 `Authorization: Bearer <token>`
或 `X-Api-Key: <token>`。

## Config

| 字段 | 说明 |
| --- | --- |
| `directusUrl` | Directus 根地址，不带 `/items` |
| `webhookUrl` | 中转地址；按租户区分时请为每个租户各建一个实例 |
| `batchLimit` | 单次拉取的交付物上限，默认 20 |

## 流程

```text
手动测试 / 每 30 分钟
  → 拉取 approved 且 kind in (social_post, sem_landing) 的交付物
  → 过滤停用租户与缺失 payload
  → 逐条 Claim（status=pushing）
  → 组装投递体（asset + tenant + UTM + 排期）
  → POST webhookUrl（Idempotency-Key = external_key）
  → 归一化响应 → 写回 status=pushed / payload.delivery
  → 写 runs（success / failed）
```

## 投递体

```json
{
  "source": "ai-seo-saas/client-kit",
  "workflow": "campaign-asset-to-channel",
  "execution_id": "123",
  "deliverable_id": "<uuid>",
  "external_key": "ita-bag-lab:sem_landing:<candidate external_id>",
  "kind": "sem_landing",
  "platform": "google_ads",
  "tenant": { "slug": "ita-bag-lab", "locale": "en", "market": "US / EU" },
  "scheduled_at": "2026-11-01T09:00:00.000Z",
  "asset": { "platform": "google_ads", "headlines": ["..."], "descriptions": ["..."], "final_url": "..." },
  "preview": { "title": "...", "body_md": "..." }
}
```

`asset` 就是 `deliverables.payload` 的原样内容，中转方不需要理解 Directus 模型。

## 回执

中转方返回 JSON 时，以下字段会被写回：

| 响应字段 | 写回位置 |
| --- | --- |
| `external_id` / `id` | `payload.delivery.external_id` |
| `external_url` / `url` | `payload.delivery.external_url` |
| `status` | `payload.delivery.remote_status` |

返回 200 且无 JSON 时按 `accepted` 记录。`deliverables.status` 统一改为 `pushed`，
`pushed_at` 写入当前时间。

## 幂等与失败

- `Idempotency-Key = deliverables.external_key`：同一素材重复投递时，中转方应返回
  相同结果而不是重复创建。
- 同一交付物只投递一次；修改文案后要重新投递，先把状态改回 `approved`，并让中转方
  按新的 `Idempotency-Key` 处理（或先清掉旧记录）。
- 投递失败：置 `status=failed` 并写 `last_error`，`runs` 记 `failed`，不自动重试。
- 投递成功但写回 Directus 失败：`status` 停留在 `pushing`，`runs` 记 `failed`；
  人工改回 `approved` 会重新投递，需靠幂等键避免重复。

## 验证方法

1. 在 Directus 把一条 `sem_landing` 或 `social_post` 交付物改为 `approved`。
2. n8n 点击“手动测试”，在中转方确认收到请求与 `Idempotency-Key`。
3. 检查 `deliverables`：`status=pushed`、`payload.delivery` 有回执字段。
4. 检查 `runs`：`status=success`，`payload_summary.platform` 与回执一致。
5. 重复执行同一交付物（先改回 `approved`），确认中转方按幂等键去重。

## 已知边界

- 不直接调用 Google Ads / Meta / LinkedIn API；原生投放在中转方实现。
- 不生成或上传图片，`payload.image_prompt` 只是给素材制作环节的说明。
- 不校验各平台的字数、字符与政策限制，审核阶段需人工把关。
