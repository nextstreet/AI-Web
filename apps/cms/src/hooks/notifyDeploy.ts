import type { CollectionAfterChangeHook, GlobalAfterChangeHook, Payload } from 'payload'

// 发布内容后触发 GitHub Actions 重建静态站点。
// 配置 apps/cms/.env：
//   DEPLOY_HOOK_URL   https://api.github.com/repos/<owner>/<repo>/dispatches
//   DEPLOY_HOOK_TOKEN 具备 repo 权限的 GitHub PAT
// 未配置时静默跳过，本地开发不受影响。

const COOLDOWN_MS = 20_000
let lastDispatchAt = 0

async function dispatch(payload: Payload, source: string) {
  const url = process.env.DEPLOY_HOOK_URL
  const token = process.env.DEPLOY_HOOK_TOKEN
  if (!url || !token) return

  const now = Date.now()
  if (now - lastDispatchAt < COOLDOWN_MS) return
  lastDispatchAt = now

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ event_type: 'cms-published', client_payload: { source } }),
      signal: AbortSignal.timeout(10_000),
    })
    if (response.ok) payload.logger.info(`[deploy] 已触发站点重建（${source}）`)
    else payload.logger.warn(`[deploy] 触发站点重建失败：HTTP ${response.status}（${source}）`)
  } catch (error) {
    payload.logger.warn(
      `[deploy] 触发站点重建失败：${error instanceof Error ? error.message : String(error)}（${source}）`,
    )
  }
}

/** 只有“发布态”或“从发布态撤回”才需要重建；草稿编辑不触发。 */
function shouldRebuild(doc: Record<string, unknown>, previousDoc?: Record<string, unknown>) {
  const next = doc._status
  if (!next) return true
  return next === 'published' || previousDoc?._status === 'published'
}

export const notifyDeployAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  collection,
}) => {
  if (shouldRebuild(doc, previousDoc)) void dispatch(req.payload, collection.slug)
  return doc
}

export const notifyDeployGlobalAfterChange: GlobalAfterChangeHook = ({ doc, req, global }) => {
  void dispatch(req.payload, global.slug)
  return doc
}
