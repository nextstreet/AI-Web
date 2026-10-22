# Client Kit — 客户交付项目

与仓库根目录的自用站点（`apps/web` + `apps/cms`）完全独立的一套交付物：

- `directus/`：自托管 Directus 12、版本化 schema 快照、确定性种子数据与服务器部署脚本
- `workflows/`：n8n 工作流导出（命名约定 `<domain>--<action>--<version>.json`）
- `docs/directus.md`：集合契约、权限、环境变量与发布重建流程

## 边界

| 关注点 | 自用项目（根目录 `apps/`） | 客户交付（本目录） |
| --- | --- | --- |
| 内容后台 | Payload 3（`apps/cms`） | Directus（`client-kit/directus`） |
| 站点读取 | `apps/web` 读 Payload REST | 暂无（原 Directus 适配层已移除） |
| 自动化 | Payload afterChange → GitHub dispatch | n8n 工作流（规划中） |
| 数据隔离 | 主 Supabase 项目、租户 `ita-bag-lab` | 每个客户独立 Supabase 项目 |

`packages/*` 与 `supabase/` 仍是共享基础：SEO 决策模型、内容 Brief 契约与
租户 RLS 迁移两边都可用，但不要把客户数据写进共享项目的 public schema。

## 当前状态

- 可以直接使用：Directus 容器、schema 快照、种子数据、部署脚本、n8n 连通性验证。
- 尚未恢复：客户的 Astro 静态站点读取。原先 `apps/web` 的 Directus 适配器
  在切换 Payload 时删除；恢复该业务时，请在本目录下重建站点模板（或从 git
  历史找回适配器），不要直接复用 `apps/web`，避免两套 CMS 再次混用。

## 快速开始

```bash
cd client-kit/directus
cp .env.example .env        # 填写 KEY / SECRET / ADMIN_*
docker compose up -d
docker compose exec directus directus schema apply /directus/snapshots/2026-10-02-cms.yaml
node seed/seed.mjs          # 需要 DIRECTUS_ADMIN_TOKEN
```

服务器一键部署与权限/令牌配置见 `directus/setup.sh` 与 `docs/directus.md`。
