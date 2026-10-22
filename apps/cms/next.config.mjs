import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 媒体目录由 nginx 直接托管，Next 只负责后台与 API。
  // 不使用 output: 'standalone'，避免 pnpm 符号链接在 Windows 下复制失败。
}

export default withPayload(nextConfig)
