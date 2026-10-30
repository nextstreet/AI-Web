# AI-Web

自用独立站：**Astro 前台 + Payload 3 后台**。前台是完整的旧版 ITA ATELIER
页面（首页、画廊、概念集合、定制 brief、设计详情、指南与内容页），后台只使用
Payload，不再依赖 Directus。

## 快速开始

要求 Node **>= 22.23.4**（Astro 7.3 engines）。

```bash
cp .env.example .env
cp apps/cms/.env.example apps/cms/.env   # 填 PAYLOAD_SECRET
pnpm install
pnpm dev:cms     # Payload: http://localhost:3000/admin
pnpm dev         # Astro:   http://localhost:4321
```

首次启动 Payload 后在 `/admin` 创建管理员，或在 `.env` 配置
`PAYLOAD_ADMIN_EMAIL/PASSWORD` 后导入旧站数据：

```bash
pnpm cms:import
```

`cms:import` 会把 `apps/cms/seed/legacy-site.json` 中的 52 个内容页和 3 个设计概念
写入 Payload。该 fixture 从旧 Supabase 一次性导出，网站运行时不再访问 Supabase。

## 结构

| 路径 | 职责 |
| --- | --- |
| `apps/web` | Astro SSR 前台（旧版 ITA ATELIER 页面） |
| `apps/cms` | Payload 3 后台：Pages / Designs / Products / Media / Users / SiteSettings |
| `packages/seo-engine` | SEO 机会评分与页面类型决策（可选基础能力） |
| `packages/content-engine` | Brief、事实注入、草稿校验（可选基础能力） |
| `supabase` | SEO 运营数据迁移（网站 CMS 不使用） |
| `scripts` | Payload 导入/导出、数据库体检 |

## 内容来源

- `SiteSettings.legacyConfig`：旧站完整配置 JSON（品牌、导航、主题、首页文案、catalog）。
- `Pages`：旧站 `/content/*` 页面，`legacyBody` 保存原有正文区块。
- `Designs`：画廊/设计概念与票数。
- `apps/web/src/content/pages`：两篇 Markdown 页面，作为构建期内容保留。

## 部署路由

生产环境建议 Caddy 按路径分流：

```text
/admin*  -> 127.0.0.1:3000  (Payload)
/api*    -> 127.0.0.1:3000  (Payload)
/media*  -> 127.0.0.1:3000  (Payload)
/*       -> 127.0.0.1:4321  (Astro SSR)
```

AI-SEO 客户交付平台（Directus + n8n + WordPress）在独立仓库维护，
不引用本仓库代码或数据。
