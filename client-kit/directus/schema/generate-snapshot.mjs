#!/usr/bin/env node
// 生成客户交付项目的 Directus 操作台快照。
// 用法：node client-kit/directus/schema/generate-snapshot.mjs
//
// 这个项目不是客户站点的 CMS：WordPress 负责页面与发布，Directus 只承载
// 租户配置、候选审批、AI 产出预览与工作流运行记录。改字段时改本文件再重跑，
// 不要把快照当成手工维护的源文件。

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(HERE, '..', 'snapshots', '2026-10-22-operator-console.yaml');

const quote = (value) => `'${String(value).replace(/'/g, "''")}'`;

const COLLECTIONS = [
  {
    name: 'tenants',
    icon: 'business',
    display: '{{name}}',
    note: '客户/场景配置。凭据只存 n8n 里的引用名，不存账号密码。',
  },
  {
    name: 'candidates',
    icon: 'lightbulb',
    display: '{{query}}',
    note: 'Supabase 候选机会的只读投影，批准/驳回后由 n8n 回写。',
  },
  {
    name: 'deliverables',
    icon: 'edit_note',
    display: '{{title}}',
    note: 'AI 产出与待推送内容。正文是待推送快照，发布后以 WordPress 为准。',
  },
  {
    name: 'runs',
    icon: 'history',
    display: '{{workflow}}',
    note: 'n8n 运行记录，用于排障与审计。',
  },
];

const PAGE_TYPES = [
  'category',
  'commercial',
  'product',
  'customization',
  'component',
  'material',
  'application',
  'design_inspiration',
  'comparison',
  'guide',
  'gallery',
  'community_topic',
];

/**
 * @param {string} collection
 * @param {string} field
 * @param {'uuid'|'string'|'text'|'integer'|'boolean'|'timestamp'|'json'} type
 */
function f(collection, field, type, options = {}) {
  return { collection, field, type, ...options };
}

const FIELDS = [
  // ----- tenants -----
  f('tenants', 'id', 'uuid', { primary: true, hidden: true, readonly: true, special: ['uuid'] }),
  f('tenants', 'name', 'string', { required: true, note: '客户或品牌名称。', width: 'half' }),
  f('tenants', 'slug', 'string', {
    required: true,
    unique: true,
    maxLength: 64,
    note: '稳定标识，Supabase 与 n8n 用它匹配租户。',
    width: 'half',
  }),
  f('tenants', 'wp_base_url', 'string', {
    required: true,
    maxLength: 255,
    note: '客户 WordPress 根地址，例如 https://example.com。',
  }),
  f('tenants', 'environment', 'select', {
    required: true,
    defaultValue: 'production',
    choices: [
      ['production', '生产'],
      ['staging', '预发'],
    ],
    note: '决定使用哪套 WP 凭据与发布策略。',
    width: 'half',
  }),
  f('tenants', 'credential_ref', 'string', {
    maxLength: 128,
    note: 'n8n 凭据名称；不要在 Directus 保存账号密码。',
    width: 'half',
  }),
  f('tenants', 'locale', 'string', { maxLength: 16, defaultValue: 'en', note: '内容语言，例如 en / zh-CN。', width: 'half' }),
  f('tenants', 'market', 'string', { maxLength: 128, note: '目标市场，例如 US / EU。', width: 'half' }),
  f('tenants', 'brand_voice', 'text', { note: '品牌语气与禁用表达，供 AI 生成时引用。' }),
  f('tenants', 'seo_plugin', 'select', {
    defaultValue: 'none',
    choices: [
      ['yoast', 'Yoast SEO'],
      ['rankmath', 'Rank Math'],
      ['none', '未安装 / 走原生字段'],
    ],
    note: '决定 SEO 元数据的写回方式。',
    width: 'half',
  }),
  f('tenants', 'publish_policy', 'select', {
    defaultValue: 'draft_only',
    choices: [
      ['draft_only', '只写草稿'],
      ['approve_then_publish', '批准后发布'],
      ['auto_publish', '自动发布'],
    ],
    note: '平台允许的最大发布权限。',
    width: 'half',
  }),
  f('tenants', 'enabled', 'boolean', { defaultValue: true, note: '停用后工作流跳过该租户。', width: 'half' }),
  f('tenants', 'notes', 'text', {}),
  f('tenants', 'date_created', 'timestamp', { hidden: true, readonly: true, special: ['date-created'], width: 'half' }),
  f('tenants', 'date_updated', 'timestamp', { hidden: true, readonly: true, special: ['date-updated'], width: 'half' }),

  // ----- candidates -----
  f('candidates', 'id', 'uuid', { primary: true, hidden: true, readonly: true, special: ['uuid'] }),
  f('candidates', 'tenant', 'uuid', {
    required: true,
    interface: 'select-dropdown-m2o',
    special: ['m2o'],
    foreignTable: 'tenants',
    foreignColumn: 'id',
    width: 'half',
  }),
  f('candidates', 'external_id', 'string', {
    required: true,
    unique: true,
    maxLength: 64,
    note: 'Supabase content_candidates.id，用于幂等同步。',
    width: 'half',
  }),
  f('candidates', 'query', 'string', { required: true, maxLength: 512, note: '目标查询或主题。' }),
  f('candidates', 'intent', 'string', { maxLength: 64, width: 'half' }),
  f('candidates', 'page_type', 'select', {
    choices: PAGE_TYPES.map((value) => [value, value]),
    width: 'half',
  }),
  f('candidates', 'channel', 'select', {
    required: true,
    defaultValue: 'seo',
    choices: [
      ['seo', 'SEO 内容'],
      ['sem_google', 'Google Ads'],
      ['social_meta', 'Meta'],
      ['social_linkedin', 'LinkedIn'],
      ['social_generic', '通用 Webhook / 导出'],
    ],
    note: '决定候选走哪条生成流程：SEO 文章/产品，或 SEM/社媒素材。',
    width: 'half',
  }),
  f('candidates', 'action', 'select', {
    required: true,
    defaultValue: 'CREATE',
    choices: [
      ['CREATE', 'CREATE'],
      ['EXPAND', 'EXPAND'],
      ['MERGE', 'MERGE'],
      ['IGNORE', 'IGNORE'],
    ],
    width: 'half',
  }),
  f('candidates', 'score', 'integer', { note: '0-100，来自 AI 评分。', width: 'half' }),
  f('candidates', 'reason', 'text', {}),
  f('candidates', 'status', 'select', {
    required: true,
    defaultValue: 'new',
    choices: [
      ['new', '待判断'],
      ['approved', '已批准'],
      ['rejected', '已驳回'],
      ['deferred', '暂缓'],
    ],
    width: 'half',
  }),
  f('candidates', 'discovered_at', 'timestamp', { width: 'half' }),
  f('candidates', 'last_synced_at', 'timestamp', { readonly: true, note: 'n8n 最近一次从 Supabase 同步的时间。', width: 'half' }),
  f('candidates', 'notes', 'text', {}),
  f('candidates', 'date_created', 'timestamp', { hidden: true, readonly: true, special: ['date-created'], width: 'half' }),
  f('candidates', 'date_updated', 'timestamp', { hidden: true, readonly: true, special: ['date-updated'], width: 'half' }),

  // ----- deliverables -----
  f('deliverables', 'id', 'uuid', { primary: true, hidden: true, readonly: true, special: ['uuid'] }),
  f('deliverables', 'tenant', 'uuid', {
    required: true,
    interface: 'select-dropdown-m2o',
    special: ['m2o'],
    foreignTable: 'tenants',
    foreignColumn: 'id',
    width: 'half',
  }),
  f('deliverables', 'candidate', 'uuid', {
    interface: 'select-dropdown-m2o',
    special: ['m2o'],
    foreignTable: 'candidates',
    foreignColumn: 'id',
    width: 'half',
  }),
  f('deliverables', 'external_key', 'string', {
    required: true,
    unique: true,
    maxLength: 160,
    note: '幂等键，建议 tenant:kind:candidateId。',
  }),
  f('deliverables', 'kind', 'select', {
    required: true,
    defaultValue: 'article',
    choices: [
      ['article', '文章'],
      ['product', '产品'],
      ['page_update', '已有页面内容更新'],
      ['social_post', '社媒内容'],
      ['sem_landing', 'SEM 落地页内容'],
    ],
    width: 'half',
  }),
  f('deliverables', 'status', 'select', {
    required: true,
    defaultValue: 'planned',
    choices: [
      ['planned', '已规划'],
      ['drafting', '生成中'],
      ['ready', '待审核'],
      ['approved', '已批准'],
      ['pushing', '推送中'],
      ['pushed', '已推送'],
      ['failed', '失败'],
      ['cancelled', '已取消'],
    ],
    width: 'half',
  }),
  f('deliverables', 'title', 'string', { required: true, maxLength: 255, width: 'half' }),
  f('deliverables', 'slug', 'string', { maxLength: 255, width: 'half' }),
  f('deliverables', 'excerpt', 'text', {}),
  f('deliverables', 'body_md', 'text', { interface: 'input-rich-text-md', note: 'Markdown 正文；由 n8n 转为 WP 区块或 HTML。' }),
  f('deliverables', 'seo_title', 'string', { maxLength: 255, width: 'half' }),
  f('deliverables', 'seo_description', 'text', {}),
  f('deliverables', 'keywords', 'json', { interface: 'tags', special: ['cast-json'], note: '目标关键词列表。' }),
  f('deliverables', 'canonical_url', 'string', { maxLength: 255, width: 'half' }),
  f('deliverables', 'target_post_type', 'select', {
    choices: [
      ['post', '文章'],
      ['product', '产品'],
      ['page', '页面'],
      ['custom', '自定义类型'],
    ],
    note: '写回 WordPress 的目标类型；社媒/SEM 类内容留空。',
    width: 'half',
  }),
  f('deliverables', 'target_post_id', 'integer', {
    note: '更新已有内容时填写 WP ID；新建留空。',
    width: 'half',
  }),
  f('deliverables', 'target_categories', 'json', {
    interface: 'tags',
    special: ['cast-json'],
    note: 'WP 分类名称列表，n8n 负责解析或创建。',
  }),
  f('deliverables', 'target_tags', 'json', { interface: 'tags', special: ['cast-json'], note: 'WP 标签名称列表。' }),
  f('deliverables', 'featured_image_url', 'string', { maxLength: 512, note: '主图地址，由 n8n 下载并上传到 WP 媒体库。' }),
  f('deliverables', 'publish_at', 'timestamp', { width: 'half', note: '计划发布时间；留空表示手动发布。' }),
  f('deliverables', 'wp_post_id', 'integer', { readonly: true, width: 'half' }),
  f('deliverables', 'wp_url', 'string', { readonly: true, maxLength: 512, width: 'half' }),
  f('deliverables', 'wp_status', 'select', {
    readonly: true,
    choices: [
      ['draft', 'draft'],
      ['publish', 'publish'],
      ['future', 'future'],
      ['private', 'private'],
      ['pending', 'pending'],
    ],
    width: 'half',
  }),
  f('deliverables', 'pushed_at', 'timestamp', { readonly: true, width: 'half' }),
  f('deliverables', 'last_error', 'text', { readonly: true }),
  f('deliverables', 'ai_model', 'string', { readonly: true, maxLength: 64, width: 'half' }),
  f('deliverables', 'ai_run_id', 'string', { readonly: true, maxLength: 64, width: 'half' }),
  f('deliverables', 'payload', 'json', {
    interface: 'input-code',
    special: ['cast-json'],
    options: { language: 'json' },
    note: '类型专属字段：WooCommerce SKU/价格/属性，或社媒渠道/排期等。',
  }),
  f('deliverables', 'notes', 'text', {}),
  f('deliverables', 'date_created', 'timestamp', { hidden: true, readonly: true, special: ['date-created'], width: 'half' }),
  f('deliverables', 'date_updated', 'timestamp', { hidden: true, readonly: true, special: ['date-updated'], width: 'half' }),

  // ----- runs -----
  f('runs', 'id', 'uuid', { primary: true, hidden: true, readonly: true, special: ['uuid'] }),
  f('runs', 'tenant', 'uuid', {
    required: true,
    interface: 'select-dropdown-m2o',
    special: ['m2o'],
    foreignTable: 'tenants',
    foreignColumn: 'id',
    width: 'half',
  }),
  f('runs', 'deliverable', 'uuid', {
    interface: 'select-dropdown-m2o',
    special: ['m2o'],
    foreignTable: 'deliverables',
    foreignColumn: 'id',
    width: 'half',
  }),
  f('runs', 'workflow', 'string', { required: true, maxLength: 128, note: 'n8n workflow 名称。', width: 'half' }),
  f('runs', 'execution_id', 'string', { unique: true, maxLength: 64, width: 'half' }),
  f('runs', 'status', 'select', {
    required: true,
    defaultValue: 'running',
    choices: [
      ['running', '运行中'],
      ['success', '成功'],
      ['failed', '失败'],
    ],
    width: 'half',
  }),
  f('runs', 'started_at', 'timestamp', { width: 'half' }),
  f('runs', 'finished_at', 'timestamp', { width: 'half' }),
  f('runs', 'error', 'text', {}),
  f('runs', 'log_excerpt', 'text', {}),
  f('runs', 'payload_summary', 'json', {
    interface: 'input-code',
    special: ['cast-json'],
    options: { language: 'json' },
    note: '请求/响应摘要，避免存整包日志。',
  }),
  f('runs', 'date_created', 'timestamp', { hidden: true, readonly: true, special: ['date-created'], width: 'half' }),
  f('runs', 'date_updated', 'timestamp', { hidden: true, readonly: true, special: ['date-updated'], width: 'half' }),
];

const RELATIONS = [
  { collection: 'candidates', field: 'tenant', related: 'tenants', required: true },
  { collection: 'deliverables', field: 'tenant', related: 'tenants', required: true },
  { collection: 'deliverables', field: 'candidate', related: 'candidates', required: false },
  { collection: 'runs', field: 'tenant', related: 'tenants', required: true },
  { collection: 'runs', field: 'deliverable', related: 'deliverables', required: false },
];

function dataTypeFor(field) {
  switch (field.type) {
    case 'uuid':
      return 'uuid';
    case 'string':
    case 'select':
      return 'varchar';
    case 'text':
      return 'text';
    case 'integer':
      return 'integer';
    case 'boolean':
      return 'boolean';
    case 'timestamp':
      return 'timestamp with time zone';
    case 'json':
      return 'json';
    default:
      throw new Error(`未知字段类型：${field.type}`);
  }
}

function renderCollection(collection) {
  return [
    `  - collection: ${collection.name}`,
    '    meta:',
    '      accountability: all',
    '      archive_app_filter: true',
    '      archive_field: null',
    '      archive_value: null',
    '      collapse: open',
    `      collection: ${collection.name}`,
    '      color: null',
    `      display_template: ${quote(collection.display)}`,
    '      group: null',
    '      hidden: false',
    `      icon: ${collection.icon}`,
    '      item_duplication_fields: null',
    `      note: ${quote(collection.note)}`,
    '      singleton: false',
    '      sort: null',
    '      sort_field: null',
    '      translations: null',
    '      unarchive_value: null',
    '    schema:',
    `      name: ${collection.name}`,
  ];
}

function renderOptions(field) {
  if (!field.choices && !field.options) return ['      options: null'];
  const lines = ['      options:'];
  if (field.choices) {
    lines.push('        choices:');
    for (const [value, text] of field.choices) {
      lines.push(`          - { text: ${quote(text)}, value: ${quote(value)} }`);
    }
    lines.push('        allowsOther: false');
  } else if (field.options) {
    for (const [key, value] of Object.entries(field.options)) {
      lines.push(`        ${key}: ${quote(value)}`);
    }
  }
  return lines;
}

function renderField(field, sort) {
  const isPrimary = Boolean(field.primary);
  const special = field.special ?? [];
  const lines = [
    `  - collection: ${field.collection}`,
    `    field: ${field.field}`,
    `    type: ${field.type}`,
    '    meta:',
    `      collection: ${field.collection}`,
    '      conditions: null',
    '      display: null',
    '      display_options: null',
    `      field: ${field.field}`,
    '      group: null',
    `      hidden: ${field.hidden ? 'true' : 'false'}`,
    `      interface: ${field.interface ?? (field.type === 'select' ? 'select-dropdown' : field.type === 'text' ? 'input-multiline' : field.type === 'boolean' ? 'boolean' : field.type === 'timestamp' ? 'datetime' : 'input')}`,
    `      note: ${field.note ? quote(field.note) : 'null'}`,
    ...renderOptions(field),
    `      readonly: ${field.readonly ? 'true' : 'false'}`,
    `      required: ${field.required ? 'true' : 'false'}`,
    `      sort: ${sort}`,
  ];

  if (special.length === 0) {
    lines.push('      special: []');
  } else {
    lines.push('      special:');
    for (const item of special) lines.push(`        - ${item}`);
  }

  lines.push(
    '      translations: null',
    '      validation: null',
    '      validation_message: null',
    `      width: ${field.width ?? 'full'}`,
    '    schema:',
    `      name: ${field.field}`,
    `      table: ${field.collection}`,
    `      data_type: ${dataTypeFor(field)}`,
    `      default_value: ${isPrimary ? 'gen_random_uuid()' : field.type === 'boolean' ? String(field.defaultValue ?? false) : field.defaultValue != null ? quote(field.defaultValue) : 'null'}`,
    `      max_length: ${field.maxLength != null ? field.maxLength : field.type === 'select' ? 255 : 'null'}`,
    `      numeric_precision: ${field.type === 'integer' ? 32 : 'null'}`,
    '      numeric_scale: null',
    `      is_nullable: ${field.required || isPrimary ? 'false' : 'true'}`,
    `      is_unique: ${field.unique ? 'true' : 'false'}`,
    `      is_primary_key: ${isPrimary ? 'true' : 'false'}`,
    '      is_generated: false',
    '      generation_expression: null',
    '      has_auto_increment: false',
    `      foreign_key_table: ${field.foreignTable ?? 'null'}`,
    `      foreign_key_column: ${field.foreignColumn ?? 'null'}`,
  );

  return lines;
}

function renderRelation(relation) {
  return [
    `  - collection: ${relation.collection}`,
    `    field: ${relation.field}`,
    `    related_collection: ${relation.related}`,
    '    meta:',
    '      junction_field: null',
    `      many_collection: ${relation.collection}`,
    `      many_field: ${relation.field}`,
    '      one_allowed_collections: null',
    `      one_collection: ${relation.related}`,
    '      one_collection_field: null',
    '      one_deselect_action: nullify',
    '      sort_field: null',
    '    schema:',
    `      table: ${relation.collection}`,
    `      column: ${relation.field}`,
    `      foreign_key_table: ${relation.related}`,
    '      foreign_key_column: id',
    '      on_update: NO ACTION',
    `      on_delete: ${relation.required ? 'NO ACTION' : 'SET NULL'}`,
  ];
}

const lines = ['version: 1', 'directus: 12.4.1', 'vendor: postgres', 'collections:'];

for (const collection of COLLECTIONS) {
  lines.push(...renderCollection(collection));
}

lines.push('fields:');

for (const collection of COLLECTIONS) {
  const fields = FIELDS.filter((field) => field.collection === collection.name);
  if (fields.length === 0) throw new Error(`集合 ${collection.name} 没有字段`);
  fields.forEach((field, index) => {
    lines.push(...renderField(field, index + 1));
  });
}

lines.push('relations:');
for (const relation of RELATIONS) {
  lines.push(...renderRelation(relation));
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${lines.join('\n')}\n`, 'utf8');
console.log(`已生成 ${OUTPUT}（${COLLECTIONS.length} 个集合，${FIELDS.length} 个字段，${RELATIONS.length} 个关系）`);
