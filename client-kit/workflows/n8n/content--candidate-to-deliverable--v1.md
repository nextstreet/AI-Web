# content--candidate-to-deliverable--v1

把 Directus 中状态为 `approved` 的候选机会，交给 AI 生成一篇待审核内容，写入
`deliverables`（`status=ready`），并把运行结果写入 `runs`。

## 前置条件

- Directus 已应用 `client-kit/directus/snapshots/2026-10-22-operator-console.yaml`。
- `tenants` 中目标租户 `enabled = true`，`locale`、`market`、`brand_voice` 已填。
- `candidates` 中存在 `status = approved` 的记录，且 `external_id` 来自 Supabase。
- n8n 能访问 Directus（同机可用 `http://127.0.0.1:8055`，容器内需改成可达地址）。

## 凭据

两个 HTTP Request 使用 **Header Auth** 通用凭据，导入后需要重新选择：

| 凭据名称 | Header | 值 |
| --- | --- | --- |
| `Directus Automation Token` | `Authorization` | `Bearer <Automation 角色的 Static Token>` |
| `AI API Key` | `Authorization` | `Bearer <OpenAI 兼容服务密钥>` |

不要把令牌写进 `Config` 节点或提交到仓库。

## Config

| 字段 | 说明 |
| --- | --- |
| `directusUrl` | Directus 根地址，不带 `/items` |
| `aiEndpoint` | OpenAI 兼容的 chat completions 地址 |
| `aiModel` | 模型名，例如 `gpt-4.1-mini` |
| `batchLimit` | 单次拉取的候选上限，默认 50 |

## 流程

```text
手动测试 / 每 15 分钟
  → 拉取 approved 候选（含 tenant）
  → 过滤停用租户与缺失 external_id
  → 生成幂等键 tenant.slug:kind:external_id
  → 逐个检查 deliverables 是否已存在
      ├─ 已存在 → 跳过
      └─ 不存在 → 组装提示词 → AI 生成 JSON
                    → 校验 title/body_md → 创建 deliverable（ready）
                    → 写 runs（success）
  任一步失败 → 写 runs（failed）
```

`kind` 映射：`page_type=product` → `product`，其余 → `article`。
`target_post_type` 同步为 `product` 或 `post`，供后续 WordPress 推送流程使用。

## 幂等与失败

- 幂等键：`tenant.slug:kind:candidate.external_id`；重复运行会跳过已有交付物。
- `runs.execution_id` 唯一；实际写入 `${$execution.id}:${candidateId}`（成功时用交付物 id），
  避免同一次执行处理多个候选时互相冲突。
- AI 返回必须是 JSON 对象且包含 `title`、`body_md`；否则本次记为失败。
- 失败不会自动改候选状态，候选保持 `approved`，修复后重跑即可。

## 验证方法

1. 在 Directus 批准一条候选（`status=approved`）。
2. n8n 打开工作流，点击“手动测试”。
3. 检查 `deliverables` 是否新增一条 `status=ready` 的记录。
4. 检查 `runs` 是否有对应的 `success` 记录。
5. 再次执行，确认 `deliverables` 数量不变（跳过路径生效）。

## 已知边界

- 只生成正文与 SEO 元数据，不写 WordPress；推送由下一条流程负责。
- 产品规格、价格等事实必须来自 Brief 或人工补充；提示词已要求缺失时写 TBD。
- SEM 与社媒内容复用同一模型，后续通过 `kind` 扩展流程，而不是复制本流程。
