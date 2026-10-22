// 把本地 Markdown 页面与 Directus 演示产品数据导入 Payload CMS。
//
// 用法：
//   $env:PAYLOAD_ADMIN_EMAIL="admin@example.com"
//   $env:PAYLOAD_ADMIN_PASSWORD="..."
//   pnpm cms:import              # 全量导入（幂等，按 slug / path 覆盖）
//   pnpm cms:import -- --dry-run # 只打印计划，不写入
//   pnpm cms:import -- --only=pages
//
// 依赖 Payload REST API，因此需要先启动后台：pnpm dev:cms

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { readDotEnv, repoRoot } from './lib/env.mjs';

const fileEnv = readDotEnv();
const env = { ...fileEnv, ...process.env };

const baseUrl = (env.PAYLOAD_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const email = env.PAYLOAD_ADMIN_EMAIL;
const password = env.PAYLOAD_ADMIN_PASSWORD;
const dryRun = process.argv.includes('--dry-run');
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const only = new Set(onlyArg ? onlyArg.slice('--only='.length).split(',') : ['site', 'products', 'pages']);

const markdownRoot = path.join(repoRoot, 'apps', 'web', 'src', 'content', 'pages');
const fixturePath = path.join(repoRoot, 'apps', 'cms', 'seed', 'legacy-content.json');

let token;

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

async function request(pathname, { method = 'GET', body, auth = true } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(auth && token ? { authorization: `JWT ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(`${method} ${pathname} -> ${response.status}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }
  return payload;
}

async function authenticate() {
  if (!email || !password) {
    fail('缺少 PAYLOAD_ADMIN_EMAIL / PAYLOAD_ADMIN_PASSWORD。请在根 .env 或环境变量中提供后台管理员账号。');
  }
  try {
    const result = await request('/api/users/login', { method: 'POST', auth: false, body: { email, password } });
    token = result.token;
  } catch (error) {
    // 首次部署时数据库没有任何用户，Payload 允许注册第一个管理员。
    try {
      const result = await request('/api/users/first-register', {
        method: 'POST',
        auth: false,
        body: { email, password, name: 'Owner', role: 'admin' },
      });
      token = result.token;
    } catch {
      fail(`登录失败，且无法注册首个管理员：${error.message}`);
    }
  }
  if (!token) fail('登录成功但没有返回 token。');
}

async function findBy(collection, field, value, { draft = false } = {}) {
  const params = new URLSearchParams({
    [`where[${field}][equals]`]: value,
    limit: '1',
    depth: '0',
  });
  if (draft) params.set('draft', 'true');
  const result = await request(`/api/${collection}?${params.toString()}`);
  return result.docs?.[0];
}

async function upsert(collection, matchField, value, data, { draft = false } = {}) {
  const existing = await findBy(collection, matchField, value, { draft });
  if (existing) {
    console.log(`  ${dryRun ? '[dry-run] 更新' : '更新'} ${collection}/${value} (id ${existing.id})`);
    if (!dryRun) await request(`/api/${collection}/${existing.id}`, { method: 'PATCH', body: data });
    return { id: existing.id, created: false };
  }
  console.log(`  ${dryRun ? '[dry-run] 新建' : '新建'} ${collection}/${value}`);
  if (dryRun) return { id: null, created: true };
  const result = await request(`/api/${collection}`, { method: 'POST', body: data });
  return { id: result.doc?.id, created: true };
}

// ----- 极简 frontmatter 解析（只覆盖本项目 Markdown 用到的结构） -----

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1);
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1);
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return trimmed;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw };

  const data = {};
  let currentKey = null;
  let currentItem = null;

  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;

    const top = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (top) {
      const [, key, rawValue] = top;
      currentKey = key;
      currentItem = null;
      data[key] = rawValue === '' ? [] : parseScalar(rawValue);
      continue;
    }

    const item = line.match(/^\s{2}-\s*(.*)$/);
    if (item && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      const rest = item[1].trim();
      const keyed = rest.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
      if (keyed) {
        currentItem = { [keyed[1]]: parseScalar(keyed[2]) };
        data[currentKey].push(currentItem);
      } else {
        currentItem = null;
        data[currentKey].push(parseScalar(rest));
      }
      continue;
    }

    const prop = line.match(/^\s{4,}([A-Za-z][\w-]*):\s*(.*)$/);
    if (prop && currentItem) currentItem[prop[1]] = parseScalar(prop[2]);
  }

  return { data, body: raw.slice(match[0].length) };
}

// ----- Markdown -> Lexical -----

const textNode = (text, format = 0) => ({
  type: 'text', text, format, style: '', mode: 'normal', detail: 0, version: 1,
});

const linkNode = (url, label) => ({
  type: 'link', format: '', indent: 0, version: 1, direction: 'ltr',
  fields: { url, newTab: false, linkType: 'custom' },
  children: [textNode(label)],
});

function inline(text) {
  const patterns = [
    { re: /\*\*([^*]+)\*\*/, build: (m) => textNode(m[1], 1) },
    { re: /`([^`]+)`/, build: (m) => textNode(m[1], 16) },
    { re: /\[([^\]]+)\]\(([^)\s]+)\)/, build: (m) => linkNode(m[2], m[1]) },
    { re: /\*([^*]+)\*/, build: (m) => textNode(m[1], 2) },
    { re: /_([^_]+)_/, build: (m) => textNode(m[1], 2) },
  ];

  const nodes = [];
  let rest = text;
  while (rest) {
    let best = null;
    for (const pattern of patterns) {
      const match = rest.match(pattern.re);
      if (match && (!best || match.index < best.match.index)) best = { match, pattern };
    }
    if (!best) {
      nodes.push(textNode(rest));
      break;
    }
    if (best.match.index > 0) nodes.push(textNode(rest.slice(0, best.match.index)));
    nodes.push(best.pattern.build(best.match));
    rest = rest.slice(best.match.index + best.match[0].length);
  }
  return nodes.length ? nodes : [textNode('')];
}

const paragraph = (children) => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', children,
});

const heading = (tag, value) => ({
  type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr', children: inline(value),
});

const listItem = (children, value = 1) => ({
  type: 'listitem', value, format: '', indent: 0, version: 1, direction: 'ltr', children,
});

const list = (listType, items) => ({
  type: 'list', listType, tag: listType === 'number' ? 'ol' : 'ul', start: 1,
  format: '', indent: 0, version: 1, direction: 'ltr',
  children: items.map((children, index) => listItem(children, index + 1)),
});

function markdownToLexical(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const nodes = [];
  let index = 0;

  const isBlockStart = (line) => /^(#{1,6}\s|```|\s*[-*+]\s|\s*\d+[.)]\s|>\s?|\s*(?:-{3,}|\*{3,}|_{3,})\s*$)/.test(line);

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index++;
      continue;
    }

    if (/^```/.test(line)) {
      index++;
      const code = [];
      while (index < lines.length && !/^```/.test(lines[index])) code.push(lines[index++]);
      index++;
      nodes.push(paragraph([textNode(code.join('\n'), 16)]));
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const tag = h[1].length === 1 ? 'h2' : `h${Math.min(h[1].length, 6)}`;
      nodes.push(heading(tag, h[2].trim()));
      index++;
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      nodes.push({ type: 'horizontalrule', version: 1 });
      index++;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(inline(lines[index++].replace(/^\s*[-*+]\s+/, '')));
      }
      nodes.push(list('bullet', items));
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(inline(lines[index++].replace(/^\s*\d+[.)]\s+/, '')));
      }
      nodes.push(list('number', items));
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoted = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoted.push(lines[index++].replace(/^\s*>\s?/, ''));
      }
      nodes.push({
        type: 'quote', format: '', indent: 0, version: 1, direction: 'ltr',
        children: [paragraph(inline(quoted.join(' ')))],
      });
      continue;
    }

    const buffer = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      buffer.push(lines[index++]);
    }
    if (buffer.length) nodes.push(paragraph(inline(buffer.join(' '))));
  }

  return nodes;
}

/** 把 frontmatter 里的结构化字段（steps / options / process）转成正文开头的小节。 */
function structuralNodes(data) {
  const nodes = [];

  if (data.pageType === 'guide' && Array.isArray(data.steps) && data.steps.length > 0) {
    nodes.push(heading('h2', 'At a glance'));
    nodes.push(list('number', data.steps.map((step) => inline(`${step.name}: ${step.text}`))));
  }

  if (data.pageType === 'customization') {
    if (Array.isArray(data.options) && data.options.length > 0) {
      nodes.push(heading('h2', 'Decisions to make'));
      for (const option of data.options) {
        nodes.push(heading('h3', option.label));
        nodes.push(paragraph(inline(option.detail)));
      }
    }
    if (Array.isArray(data.process) && data.process.length > 0) {
      nodes.push(heading('h2', 'Project path'));
      nodes.push(list('number', data.process.map((step) => inline(step))));
    }
  }

  return nodes;
}

function bodyForPage(data, markdown) {
  const children = [...structuralNodes(data), ...markdownToLexical(markdown)];
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } };
}

// ----- 导入流程 -----

function listMarkdownFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) return listMarkdownFiles(fullPath);
    return fullPath.endsWith('.md') ? [fullPath] : [];
  });
}

async function importSite(fixture) {
  if (!fixture.site) return;
  const data = {
    brandName: fixture.site.brandName,
    tagline: fixture.site.tagline,
    footerText: fixture.site.footerText,
    nav: fixture.site.nav.map((item) => ({ label: item.label, href: item.href, external: false })),
  };
  console.log(`${dryRun ? '[dry-run] ' : ''}站点设置 site-settings`);
  if (!dryRun) await request('/api/globals/site-settings', { method: 'POST', body: data });
}

async function importProducts(fixture) {
  const categoryIds = new Map();
  console.log(`${dryRun ? '[dry-run] ' : ''}产品分类 ${fixture.categories.length} 个`);
  for (const category of fixture.categories) {
    const { id } = await upsert('categories', 'slug', category.slug, {
      name: category.name,
      slug: category.slug,
      description: category.description,
      sort: category.sort,
    });
    categoryIds.set(category.slug, id);
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}产品 ${fixture.products.length} 个`);
  for (const product of fixture.products) {
    const categoryId = categoryIds.get(product.categorySlug);
    const data = {
      name: product.name,
      slug: product.slug,
      excerpt: product.description,
      ...(categoryId ? { category: categoryId } : {}),
      priceFrom: product.priceFrom,
      currency: product.currency,
      leadTime: product.leadTime,
      highlights: (product.highlights ?? []).map((item) => ({ title: item.title, text: item.text })),
      specs: (product.specs ?? []).map((item) => ({ label: item.label, value: item.value })),
      seo: { description: product.description },
      ...(product.ai ? {
        ai: {
          prompt: product.ai.prompt,
          model: product.ai.model,
          generatedAt: product.ai.generatedAt,
        },
      } : {}),
      _status: 'published',
    };
    await upsert('products', 'slug', product.slug, data, { draft: true });
  }
}

async function importPages() {
  if (!statSync(markdownRoot).isDirectory()) fail(`找不到 Markdown 目录：${markdownRoot}`);

  const files = listMarkdownFiles(markdownRoot);
  const entries = files.map((file) => {
    const raw = readFileSync(file, 'utf8');
    const { data, body } = parseFrontmatter(raw);
    return { file, data, body, slug: path.basename(file, '.md') };
  });

  console.log(`${dryRun ? '[dry-run] ' : ''}页面 ${entries.length} 个`);

  const idByTopic = new Map();
  for (const entry of entries) {
    const { data, slug, body } = entry;
    if (!data.canonicalPath) fail(`${entry.file} 缺少 canonicalPath`);
    if (!data.title) fail(`${entry.file} 缺少 title`);

    const pageData = {
      title: data.title,
      slug,
      path: data.canonicalPath,
      pageType: data.pageType,
      excerpt: data.description,
      body: bodyForPage(data, body),
      seo: {
        description: data.description,
        ...(data.targetKeyword ? { keywords: [{ keyword: data.targetKeyword }] } : {}),
      },
      _status: 'published',
    };

    const { id } = await upsert('pages', 'path', data.canonicalPath, pageData, { draft: true });
    if (id && data.topicId) idByTopic.set(data.topicId, id);
  }

  for (const entry of entries) {
    const relatedIds = (entry.data.relatedTopicIds ?? [])
      .map((topicId) => idByTopic.get(topicId))
      .filter((id) => id !== undefined);
    if (relatedIds.length === 0) continue;
    const ownId = idByTopic.get(entry.data.topicId);
    if (!ownId) continue;
    console.log(`  ${dryRun ? '[dry-run] 关联' : '关联'} ${entry.data.canonicalPath} -> ${relatedIds.length} 个页面`);
    if (!dryRun) {
      await request(`/api/pages/${ownId}`, {
        method: 'PATCH',
        body: { relatedPages: relatedIds, _status: 'published' },
      });
    }
  }
}

async function main() {
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  console.log(`Payload: ${baseUrl}${dryRun ? '（dry-run，不写入）' : ''}`);

  if (!dryRun) await authenticate();

  if (only.has('site')) await importSite(fixture);
  if (only.has('products')) await importProducts(fixture);
  if (only.has('pages')) await importPages();

  console.log('\n完成。前台构建前请确认已设置 PAYLOAD_URL。');
}

main().catch((error) => fail(error.stack ?? error.message));
