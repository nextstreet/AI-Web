#!/usr/bin/env node
// 项目体检：一条命令检查本地环境与外部服务的连通性。
// 用法：pnpm health

import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { readDotEnv, getSupabaseDbUrl, repoRoot } from './lib/env.mjs';

let failures = 0;
let warnings = 0;
const ok = (message) => console.log(`  ✓ ${message}`);
const warn = (message) => {
  warnings += 1;
  console.log(`  ! ${message}`);
};
const bad = (message) => {
  failures += 1;
  console.log(`  ✗ ${message}`);
};

console.log(`仓库：${repoRoot}\n`);

// 1. Node 版本
console.log('[Node]');
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor >= 22) ok(`Node ${process.versions.node}（要求 >= 22）`);
else bad(`Node ${process.versions.node} 低于要求的 22`);

// 2. pnpm
console.log('\n[pnpm]');
const pnpm = spawnSync('pnpm --version', { shell: true, encoding: 'utf8' });
if (pnpm.status === 0) ok(`pnpm ${String(pnpm.stdout).trim()}`);
else bad('pnpm 不可用，请先安装：npm install -g pnpm');

// 3. Supabase CLI
console.log('\n[Supabase CLI]');
const supabase = spawnSync('supabase --version', { shell: true, encoding: 'utf8' });
if (supabase.status === 0) ok(`supabase ${String(supabase.stdout).trim().split('\n')[0]}`);
else warn('Supabase CLI 未安装（pnpm db:push 需要它）：npm install -g supabase');

// 4. .env 完整性
console.log('\n[.env 配置]');
const env = readDotEnv();
if (Object.keys(env).length === 0) bad('未找到 .env 文件');
else {
  if (env.SUPABASE_DB_URL) ok('SUPABASE_DB_URL 已配置');
  else bad('缺少 SUPABASE_DB_URL');

  const payloadUrl = (env.PAYLOAD_URL ?? '').trim();
  if (payloadUrl) ok(`PAYLOAD_URL 已配置：${payloadUrl}`);
  else warn('PAYLOAD_URL 未配置（Astro 构建将使用本地 Markdown 兜底）');
}

// 5. Supabase 数据库连通
console.log('\n[Supabase 数据库]');
const dbUrl = getSupabaseDbUrl();
if (!dbUrl) {
  bad('无法检查：缺少 SUPABASE_DB_URL');
} else {
  const client = new pg.Client({ connectionString: dbUrl, connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    const { rows } = await client.query('select count(*)::int as count from public.tenants');
    ok(`连接成功，tenants 表 ${rows[0].count} 行`);
  } catch (error) {
    bad(`连接失败：${error.message}`);
  } finally {
    await client.end().catch(() => {});
  }
}

// 6. Payload 可达（仅在配置了 URL 时检查）
console.log('\n[Payload CMS]');
const payloadUrl = (env.PAYLOAD_URL ?? '').replace(/\/$/, '');
if (!payloadUrl) {
  warn('未配置 PAYLOAD_URL，跳过检查');
} else {
  try {
    const response = await fetch(`${payloadUrl}/api/pages?limit=1`, { signal: AbortSignal.timeout(10000) });
    if (response.ok) ok(`服务可达：${payloadUrl}`);
    else bad(`服务响应异常：HTTP ${response.status}`);
  } catch (error) {
    bad(`不可达：${payloadUrl}（${error.message}）`);
  }
}

console.log(
  `\n体检完成：${failures === 0 && warnings === 0 ? '全部正常' : `${failures} 个错误，${warnings} 个提醒`}`,
);
process.exit(failures === 0 ? 0 : 1);
