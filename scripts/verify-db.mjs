#!/usr/bin/env node
// 远端 Supabase 数据库体检：连接、13 张 SEO 表、RLS、租户种子数据。
// 用法：pnpm db:verify

import pg from 'pg';
import { getSupabaseDbUrl } from './lib/env.mjs';

const expectedTables = [
  'tenants',
  'tenant_members',
  'strategy_profiles',
  'topics',
  'topic_relations',
  'keywords',
  'query_clusters',
  'query_cluster_keywords',
  'content_pages',
  'content_candidates',
  'candidate_status_events',
  'design_concepts',
  'votes',
];

let failures = 0;
const ok = (message) => console.log(`  ✓ ${message}`);
const bad = (message) => {
  failures += 1;
  console.log(`  ✗ ${message}`);
};

const dbUrl = getSupabaseDbUrl();
if (!dbUrl) {
  console.error('✗ 未找到 SUPABASE_DB_URL。请在 .env 中配置。');
  process.exit(1);
}

const client = new pg.Client({ connectionString: dbUrl, connectionTimeoutMillis: 15000 });

try {
  await client.connect();
  ok('数据库连接成功');

  const { rows: tableRows } = await client.query(
    `select c.relname as name, c.relrowsecurity as rls
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r'`,
  );
  const tables = new Map(tableRows.map((row) => [row.name, row.rls]));

  for (const name of expectedTables) {
    if (!tables.has(name)) bad(`缺少表 public.${name}`);
    else if (tables.get(name) === false) bad(`表 public.${name} 未开启 RLS`);
    else ok(`表 ${name} 存在且已开启 RLS`);
  }

  const { rows: tenants } = await client.query('select slug from public.tenants');
  if (tenants.some((row) => row.slug === 'ita-bag-lab')) {
    ok('租户种子数据 ita-bag-lab 已就绪');
  } else {
    bad('缺少租户 ita-bag-lab（需要重新执行 seed）');
  }
} catch (error) {
  bad(`数据库检查失败：${error.message}`);
} finally {
  await client.end().catch(() => {});
}

console.log(failures === 0 ? '\n数据库检查全部通过。' : `\n发现 ${failures} 个问题。`);
process.exit(failures === 0 ? 0 : 1);
