# Documentation Map

| Document | Read when |
| --- | --- |
| `DEVELOPMENT.md` | understanding product scope, SEO rules, lifecycle, and V1 boundaries |
| `ARCHITECTURE.md` | changing package boundaries or end-to-end data flow |
| `DATABASE.md` | writing migrations, queries, RLS, or tenant-owned models |
| `DECISIONS.md` | proposing a framework, CMS, database, or major architectural change |
| `CURRENT-SPRINT.md` | selecting the next implementation task |
| `LEGACY-STOREFRONT.md` | working on the restored ITA ATELIER pages, Payload schema, or legacy import |
| `DEPLOYMENT.md` | deploying, restarting, or rolling back the live site |
| `ROADMAP.md` | checking phase order and deferrals |
| `CODEX-LOCAL-WORKFLOW.md` | using Trae + Codex CLI and writing task prompts |

客户交付项目（Directus + n8n）已拆为独立仓库，本文档只覆盖自用站点项目的
Payload 内容模型。

`AGENTS.md` at repository root is the mandatory AI entry point. Documentation
describes the current source of truth; code changes that invalidate it must
update the relevant document in the same task.
