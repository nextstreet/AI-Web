#!/usr/bin/env node
// 把远端 Supabase 数据库结构同步到最新迁移。
// 用法：pnpm db:push            （实际执行）
//       pnpm db:push --dry-run  （只预览差异）
//
// 密码从 .env 读取并做 URL 编码，通过环境变量传给 Supabase CLI，
// 避免特殊字符（+ $ ? 等）被 shell 破坏，也不会出现在命令行参数里。

import { spawnSync } from 'node:child_process';
import { getSupabaseDbUrl } from './lib/env.mjs';

const dbUrl = getSupabaseDbUrl();
if (!dbUrl) {
  console.error('✗ 未找到 SUPABASE_DB_URL。请在仓库根目录 .env 中配置数据库连接串。');
  process.exit(1);
}

// 只放行形如 --dry-run 的安全旗标。
const flags = process.argv.slice(2).filter((arg) => /^--[a-z][a-z0-9-]*$/.test(arg));

// Windows 下 Node 的 shell 固定为 cmd.exe，不会展开 $ ? 等字符，密码可安全内联；
// POSIX 下不走 shell，直接传参数数组，同样没有展开风险。
const isWindows = process.platform === 'win32';
const result = isWindows
  ? spawnSync(`supabase db push --db-url ${dbUrl}${flags.map((f) => ` ${f}`).join('')}`, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    })
  : spawnSync('supabase', ['db', 'push', '--db-url', dbUrl, ...flags], {
      stdio: 'inherit',
      shell: false,
      cwd: process.cwd(),
    });

if (result.error) {
  console.error('✗ 无法启动 Supabase CLI。请先安装：npm install -g supabase');
  process.exit(1);
}

process.exit(result.status ?? 1);
