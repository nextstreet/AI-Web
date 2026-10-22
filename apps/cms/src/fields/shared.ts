import type { Field } from 'payload'

/** SEO 字段组：所有可被搜索引擎索引的内容类型共用 */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'SEO 标题',
      localized: true,
      admin: { description: '留空时回退到内容标题，建议 50–60 字符' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Meta 描述',
      localized: true,
      admin: { description: '建议 120–158 字符' },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      label: 'Canonical URL',
      admin: { description: '仅在需要指向其他规范地址时填写' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: '社交分享图',
      admin: { description: 'Open Graph / Twitter Card 使用的图片' },
    },
    {
      name: 'keywords',
      type: 'array',
      label: '目标关键词',
      localized: true,
      fields: [{ name: 'keyword', type: 'text', label: '关键词', required: true }],
    },
    {
      name: 'noindex',
      type: 'checkbox',
      label: '禁止索引',
      defaultValue: false,
    },
  ],
}

/** AI 生成溯源字段组：由生成脚本写入，人工编辑时只读更安全 */
export const aiField: Field = {
  name: 'ai',
  type: 'group',
  label: 'AI 生成信息',
  admin: { description: '由生成脚本自动写入，用于溯源与质量追踪' },
  fields: [
    { name: 'prompt', type: 'textarea', label: '使用的提示词' },
    { name: 'model', type: 'text', label: '模型' },
    { name: 'generatedAt', type: 'date', label: '生成时间' },
    {
      name: 'sourceCandidateId',
      type: 'text',
      label: '来源候选 ID',
      admin: { description: '对应 Supabase content_candidates.id，用于回连决策记录' },
    },
  ],
}

/** 问答条目字段，产品区块与页面共用 */
export const faqItemFields: Field[] = [
  { name: 'question', type: 'text', label: '问题', required: true, localized: true },
  { name: 'answer', type: 'textarea', label: '回答', required: true, localized: true },
]

export const faqItemsField: Field = {
  name: 'items',
  type: 'array',
  label: '问答条目',
  fields: faqItemFields,
}
