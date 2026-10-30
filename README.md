# AI SEO SaaS V1

本仓库只包含自用独立站（Astro + Payload）与它依赖的 SEO 决策引擎、Supabase 基础模型。
客户交付套件（Directus 操作台 + n8n）已拆到独立仓库，本仓库不引用它的代码或数据。

V1 的目标不是“生成最多文章”，而是尽快跑通：

```text
Facts -> Topic Graph -> Candidate -> Brief -> Review -> Page -> Performance
```

## 快速开始（自用项目）

```bash
cp .env.example .env
pnpm install
pnpm dev:cms     # Payload 后台，http://localhost:3000/admin
pnpm dev         # Astro 前台，http://localhost:4321
```

导入本地 Markdown 页面与演示产品（需要后台已启动，并配置管理员账号）：

```bash
pnpm cms:import
```

验证整个仓库：

```bash
pnpm check
```

本地 Supabase（需要 Docker 与 Supabase CLI）：

```bash
supabase start
supabase db reset
```

## 当前可演示闭环

- `/studio/`：在构建时运行 Topic Graph、机会评分、人工批准与 Brief 生成。
- `/custom/custom-ita-bag-design/` 与 `/guides/how-to-design-an-ita-bag/`：由 Payload 发布的页面。
- `/products/`：由 Payload 管理的产品目录与详情页（规格、图集、展示区块）。
- 未设置 `PAYLOAD_URL` 时回退到 `apps/web/src/content` 的 Markdown。
- 候选状态只能沿受控路径推进；数据库 migration 保存带理由的状态历史。

当前 Studio 使用确定性的内存仓储作为本地演示。Supabase schema 是持久化边界，接入线上项目前仍需在本地执行 migration reset 和 RLS 集成测试。

## 目录

| 路径 | 职责 |
| --- | --- |
| `apps/web` | 自用项目的 Astro SEO 站点 |
| `apps/cms` | 自用项目的 Payload 后台、迁移与内容模型 |
| `packages/shared` | 通用类型、Schema、常量 |
| `packages/seo-engine` | SEO 决策与机会评分 |
| `packages/content-engine` | Brief、事实注入、内容验证 |
| `supabase` | PostgreSQL migration 与种子数据（共享基础模型） |
| `scripts` | 数据库推送/校验、体检与 Payload 导入脚本 |
| `docs` | 自用项目的架构、数据库、路线图与本地开发上下文 |

自用项目请先阅读 [AGENTS.md](AGENTS.md) 与
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)；全部文档入口见
[docs/README.md](docs/README.md)。
