# Directus 操作台（客户交付项目）

> 本文件属于 `client-kit/`。Directus 在这里不是客户站点的 CMS，也不是前台：
> 客户网站是 WordPress，页面与最终内容以 WordPress 为准。Directus 只是运营者
> 登录使用的作战控制台，负责看 AI 决策、批准候选、预览产出、触发工作流与排障。

## 系统位置

```text
Supabase（事实：租户、策略、关键词、候选、Brief、指标）
        ↕
       AI（判断与生成）
        ↕
Directus（操作台：配置、队列、预览、触发、运行记录）
        ↕
n8n（执行器：调用 WordPress REST，写草稿/更新/发布）
        ↕
客户 WordPress（系统记录：文章、产品、页面、媒体、SEO 插件）
```

- 平台**不生成前台页面**，也不管理 WP 主题、菜单、模板。
- 需要落地页时，页面由客户在 WP 后台建好，平台只规划并生成内容，或更新已有页面。
- 文章、产品的创建/更新/发布可以由平台通过 n8n 调用 WordPress 完成。
- 客户不需要登录本平台；当前只服务运营者本人。

## 数据模型

快照：`snapshots/2026-10-22-operator-console.yaml`，由
`schema/generate-snapshot.mjs` 生成。改字段时改生成器并重跑，不要手工改快照。

| 集合 | 角色 | 关键字段 |
| --- | --- | --- |
| `tenants` | 客户/场景切换 | `slug`、`wp_base_url`、`environment`、`credential_ref`、`locale`、`market`、`brand_voice`、`seo_plugin`、`publish_policy`、`enabled` |
| `candidates` | Supabase 候选的只读投影与审批 | `external_id`、`query`、`intent`、`page_type`、`channel`、`action`、`score`、`reason`、`status` |
| `deliverables` | AI 产出与推送对象 | `external_key`、`kind`、`status`、`title`、`body_md`、SEO 字段、`target_post_type`、`target_post_id`、`wp_post_id`、`wp_url`、`wp_status`、`payload` |
| `runs` | n8n 运行记录 | `workflow`、`execution_id`、`status`、`error`、`payload_summary` |

设计约束：

- `tenants.slug`、`candidates.external_id`、`deliverables.external_key` 唯一，保证工作流可幂等重跑。
- `deliverables.body_md` 是待推送快照；推送成功后以 WordPress 内容为准，不在两处同时编辑。
- `payload` 存放类型专属字段：WooCommerce 的 SKU/价格/属性，或社媒渠道、文案结构、排期与投递回执（`delivery`）。
- `candidates.channel` 决定生成分流：`seo` 走文章/产品，`sem_google` / `social_meta` / `social_linkedin` / `social_generic` 走 SEM/社媒素材。
- 凭据不进 Directus：`credential_ref` 只是 n8n 凭据名称。

## 与 Supabase / AI 的契约

- Supabase 仍是候选、Brief、评分、状态与指标的唯一事实源；`candidates` 只是投影。
- n8n 同步候选时按 `external_id` upsert，并更新 `last_synced_at`。
- 在 Directus 批准/驳回后，由 n8n 把决定回写 Supabase，再进入 Brief 与生成。
- 生成完成后写入 `deliverables`，写入 `ai_model`、`ai_run_id`，并把执行情况写入 `runs`。
- 不在 Directus 重算评分或改写候选状态机，避免两套规则。

## WordPress 写入约定

1. **草稿优先**：首次推送一律 `status=draft`；发布是单独动作，受 `publish_policy` 限制。
2. **幂等**：先按 `external_key` 查 `deliverables`，有 `wp_post_id` 走更新，没有才创建。
3. **目标类型**：`target_post_type` 为 `post` / `product` / `page`；`target_post_id` 用于更新已有内容。
   `custom` 目前会被推送流程跳过，等确认客户的 REST 路由后再接。
4. **SEO 元数据**：`tenants.seo_plugin` 为 `yoast` 或 `rankmath` 时，通过 WP 侧暴露的自定义字段写入；为 `none` 时退回标题、摘要与原生字段。不同客户环境需先验证 REST 是否暴露这些字段。
5. **媒体**：`featured_image_url` 先按文件名在 WP 媒体库检索，命中则复用，未命中才下载上传，并写入 alt。
6. **失败可见**：写入失败时更新 `deliverables.last_error`，并向 `runs` 追加一条失败记录，不静默丢弃。

## 部署

```bash
cd client-kit/directus
cp .env.example .env
docker compose up -d
./setup.sh http://<服务器地址>:8055
```

`setup.sh` 会生成密钥、启动容器、等待健康检查并应用快照。之后在后台：

1. 用 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 登录，保持管理员身份自用。
2. 新建 `Automation` 角色，只授予 4 个集合的 Item 读写权限，生成 Static Token 供 n8n 使用。
3. 在 n8n 中创建 WordPress Application Password 凭据，名称与 `tenants.credential_ref` 一致。

## 种子数据

```powershell
$env:DIRECTUS_URL = "http://localhost:8055"
$env:DIRECTUS_ADMIN_TOKEN = "<管理员令牌>"
node client-kit/directus/seed/seed.mjs --dry-run
node client-kit/directus/seed/seed.mjs
```

按 `tenants.slug`、`candidates.external_id`、`deliverables.external_key`、`runs.execution_id`
幂等写入：1 个演示租户、4 条候选（2 条 SEO、1 条 Google Ads、1 条 Meta）、2 条交付物、
1 条运行记录。演示数据里的 `wp_base_url`、`credential_ref`、`seo_plugin` 需要替换为真实客户值。

## n8n 工作流

- `workflows/n8n/content--candidate-to-deliverable--v1.json`：每 15 分钟拉取
  `approved` 候选，调用 AI 生成内容，写入 `deliverables`（`status=ready`）与 `runs`。
  导入前必须重新选择 Directus 与 AI 两个 Header Auth 凭据，并在 `Config` 节点填写
  `directusUrl`、`aiEndpoint`、`aiModel`。详细说明见同名 `.md`。
- `workflows/n8n/content--deliverable-to-wordpress--v1.json`：把 `approved` 交付物
  推送到 WordPress（文章/页面走 `wp/v2`，产品走 `wc/v3`），默认只写草稿，并把
  `wp_post_id`、`wp_url`、`wp_status`、`pushed_at` 写回 `deliverables`。需要
  WordPress Application Password 与 WooCommerce Consumer Key/Secret 两套凭据；
  一个实例对应一套站点凭据。详细说明见同名 `.md`。
- `workflows/n8n/content--candidate-to-campaign-asset--v1.json`：处理
  `channel != seo` 的候选，按渠道生成 SEM/社媒素材（Google RSA、Meta、LinkedIn、
  通用），写入 `deliverables`（`kind=sem_landing|social_post`，`status=ready`），
  结构化结果放在 `payload`。只处理 `channel=seo` 的文章流程与此流程互不重叠。
- `workflows/n8n/content--campaign-asset-to-channel--v1.json`：把 `approved` 的
  SEM/社媒交付物 POST 到 `Config.webhookUrl`（`Idempotency-Key = external_key`），
  成功写回 `status=pushed` 与 `payload.delivery`，失败置 `failed` 并写 `runs`。

## 不做的事

- 不恢复 `cms_pages` / `cms_blocks` / `cms_navigation` / `cms_products` 这套静态站模型。
- 不把 Directus 接回 `apps/web`。
- 不把 WordPress 账号密码写进 Directus 字段或前端代码。
- 不在 Directus 里维护与 WordPress 并行的第二份最终内容。
