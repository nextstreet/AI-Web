import type { Access } from 'payload'

/** 已登录用户可以读写全部内容 */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * 匿名请求只能读到已发布内容。
 * 开启草稿后 Payload 会为每个文档维护 _status 字段。
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
