# content--deliverable-to-wordpress--v1

把 Directus 中状态为 `approved` 的交付物推送到客户 WordPress：文章/页面走
`wp/v2`，产品走 WooCommerce `wc/v3`。默认只写草稿，并把 `wp_post_id`、
`wp_url`、`wp_status`、`pushed_at` 写回 `deliverables`，运行结果写入 `runs`。

## 前置条件

- Directus 已应用 `client-kit/directus/snapshots/2026-10-22-operator-console.yaml`。
- `tenants.enabled = true` 且 `wp_base_url` 可从 n8n 访问（不要带结尾 `/`）。
- 交付物 `status = approved`，且 `target_post_type` 为 `post` / `page` / `product`。
- WordPress 已开启 REST API 与 Application Password；产品需要 WooCommerce REST
  Consumer Key / Secret。
- 凭据按 `tenants.environment` 选择：生产与预发不要在同一个工作流实例里混用。

## 凭据

| 凭据名称 | 类型 | 使用节点 |
| --- | --- | --- |
| `Directus Automation Token` | Header Auth | 拉取、Claim、写回、`runs` |
| `WordPress Application Password` | Basic Auth | `Media lookup`、`Upload media`、`Push content` |
| `WooCommerce API Keys` | Basic Auth（Consumer Key/Secret） | `Push product`、`Update product` |

n8n 的凭据是绑定在节点上的，不能按 `tenant` 动态切换。一个工作流实例对应一套
WordPress / WooCommerce 凭据；多客户站点请为每个站点复制一份流程（或将推送节点
下沉为按租户路由的子流程），不要试图在 `Config` 里保存账号。

## Config

| 字段 | 说明 |
| --- | --- |
| `directusUrl` | Directus 根地址，不带 `/items` |
| `batchLimit` | 单次拉取的交付物上限，默认 20 |
| `writeSeoMeta` | 是否写入 Yoast / Rank Math 元数据，默认 `false` |

`writeSeoMeta` 打开前必须先确认目标站点的 REST 暴露了对应 meta key：
Yoast 为 `_yoast_wpseo_title`、`_yoast_wpseo_metadesc`、`_yoast_wpseo_canonical`；
Rank Math 为 `rank_math_title`、`rank_math_description`、`rank_math_canonical_url`。
未注册的 meta 会被 WordPress 静默丢弃。

## 流程

```text
手动测试 / 每 15 分钟
  → 拉取 approved 交付物（含 tenant）
  → 过滤停用租户、缺失 wp_base_url、目标类型不支持
  → 逐条 Claim（status=pushing）
  → Build payload（Markdown → HTML、状态决策、SEO meta）
      ├─ 产品 → 有 wp_post_id/target_post_id 走 PUT，否则 POST（wc/v3）
      └─ 文章/页面 → 有主图：查重 → 上传 → 关联 featured_media
                        → POST wp/v2/{posts|pages}[/{id}]
  → 写回 wp_post_id / wp_url / wp_status / pushed_at（status=pushed）
  → 写 runs（success / failed）
```

## 状态决策

由 `tenants.publish_policy` 决定，工作流本身不会越过它：

| publish_policy | 无 publish_at | publish_at 在未来 | publish_at 已过 |
| --- | --- | --- | --- |
| `draft_only` | `draft` | `draft` | `draft` |
| `approve_then_publish` | `publish` | `future`（产品降级为 `draft`） | `publish` |
| `auto_publish` | `publish` | `future`（产品降级为 `draft`） | `publish` |

## 幂等与失败

- 已有 `wp_post_id`（或手工填的 `target_post_id`）走更新，否则创建；不会重复建内容。
- `runs.execution_id` 唯一，重复提交运行记录会因唯一约束失败，但内容不会重复。
- 推送成功但写回 Directus 失败时：WordPress 已有内容，`deliverables` 停留在
  `pushing`，`runs` 记录失败。手工把状态改回 `approved` 重跑即可（会走更新）。
- 推送失败时置 `status=failed` 并写 `last_error`，不会自动重试；人工修正后改回
  `approved`。
- 执行中断可能留下 `pushing` 记录，这是需要人工巡检的异常状态。

## 媒体

- 主图先按文件名 `search` 查询媒体库，命中则复用，未命中才下载并上传。
- 上传失败不会阻断正文推送，`runs.payload_summary.media_warning` 会记录。
- 产品不走媒体上传，直接把 `featured_image_url` 作为 `images[0].src` 交给
  WooCommerce。

## 已知边界

- 分类/标签只发送数字 ID（WordPress REST 只接受 term ID）。名称会出现在
  `runs.payload_summary.skipped_terms`，需要人工在 WP 里建好 term 后把 ID 填回
  `target_categories` / `target_tags`。term 自动解析/创建是下一步。
- Markdown 转换只覆盖标题（`#`–`######`）、段落、无序/有序列表、粗体、斜体、
  链接；不支持表格、图片与代码块。
- 不负责模板、主题、菜单与落地页结构；落地页内容只能写入客户已建好的页面。
- 不写 SEM 与社媒渠道，后续按 `kind` 扩展独立流程。

## 验证方法

1. 在 Directus 把一条 `ready` 交付物改为 `approved`，确认 `target_post_type` 正确。
2. n8n 打开工作流，点击“手动测试”。
3. WordPress 后台确认出现草稿，分类/标签/主图符合预期（`publish_policy=draft_only`）。
4. 检查 `deliverables`：`status=pushed`、`wp_post_id`、`wp_url`、`pushed_at` 已写入。
5. 检查 `runs`：`status=success`，`payload_summary` 含 `action`、`wp_status`、
   `skipped_terms`。
6. 再次执行同一交付物（先改回 `approved`），确认走更新而不是新建。
