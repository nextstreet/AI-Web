# Client Kit — 客户交付项目

与根目录的自用站点（`apps/web` + `apps/cms`）完全独立的一套交付物：

- `directus/`：自托管 Directus 12 操作台、版本化 schema 快照、确定性种子数据与服务器部署脚本
- `workflows/`：n8n 工作流导出（命名约定 `<domain>--<action>--<version>.json`）
- `docs/directus.md`：集合契约、权限、WordPress 写入约定与部署流程

## 定位

客户网站是 **WordPress**，页面、产品与最终内容以 WordPress 为准。平台不生成前台，
也不管理 WP 主题、菜单与模板；Directus 只是运营者登录使用的操作台：

```text
Supabase（决策/指标） → AI（判断/生成） → Directus（审批/预览/触发）
                                            ↓
                                          n8n
                                            ↓
                                  客户 WordPress（发布）
```

| 关注点 | 自用项目（`apps/`） | 客户交付（本目录） |
| --- | --- | --- |
| 内容源 | Payload（`apps/cms`） | 客户 WordPress |
| 操作界面 | Payload 后台 | Directus（仅运营者） |
| 前台 | `apps/web`（Astro 读 Payload） | 客户自己的 WordPress 站点 |
| 自动化 | Payload afterChange → GitHub dispatch | n8n 调 WordPress REST |
| 数据隔离 | 主 Supabase 项目 | 每个客户独立 Supabase 项目 |

`packages/*` 与 `supabase/` 仍是共享基础：SEO 决策模型、Brief 契约与租户 RLS
两边都可用，但不要把客户数据写进共享项目的 public schema。

## 当前状态

- 可以使用：Directus 容器、4 个集合的操作台模型、种子数据、部署脚本。
- 已实现：`content--candidate-to-deliverable--v1`（approved 候选 → AI → deliverables/runs）。
- 已实现：`content--deliverable-to-wordpress--v1`（approved 交付物 → WP 草稿/更新 + 回写状态）。
- 已实现：`content--candidate-to-campaign-asset--v1`（SEM/社媒候选 → 渠道化素材）。
- 已实现：`content--campaign-asset-to-channel--v1`（approved 素材 → Webhook 中转 + 投递回执）。
- 尚未实现：候选同步、分类/标签名称自动解析、Google Ads / Meta / LinkedIn 原生 API。
- 不需要：客户登录、Directus 前台、静态站点模板。

## 快速开始

```bash
cd client-kit/directus
cp .env.example .env        # 填写 KEY / SECRET / ADMIN_*
docker compose up -d
./setup.sh http://<服务器地址>:8055
```

本地已有 Directus 时，可只应用模型与种子：

```powershell
docker compose exec directus directus schema apply /directus/snapshots/2026-10-22-operator-console.yaml
$env:DIRECTUS_ADMIN_TOKEN = "<管理员令牌>"
node client-kit/directus/seed/seed.mjs --dry-run
node client-kit/directus/seed/seed.mjs
```

数据模型由 `directus/schema/generate-snapshot.mjs` 生成；改字段时改生成器并重跑，
不要手工编辑快照。详细契约见 `docs/directus.md`。
