import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '../access'
import { aiField, faqItemFields, seoField } from '../fields/shared'
import { notifyDeployAfterChange } from '../hooks/notifyDeploy'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: '页面', plural: '页面' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pageType', '_status', 'updatedAt'],
    group: '内容',
    description: '指南、专题与独立落地页。产品详情请使用「产品」集合',
  },
  versions: { drafts: true },
  access: { read: publishedOrAuthenticated },
  hooks: { afterChange: [notifyDeployAfterChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '基础信息',
          fields: [
            { name: 'title', type: 'text', label: '标题', required: true, localized: true },
            {
              name: 'slug',
              type: 'text',
              label: 'URL 别名',
              required: true,
              unique: true,
              index: true,
            },
            {
              name: 'path',
              type: 'text',
              label: '站点路径',
              required: true,
              unique: true,
              index: true,
              admin: {
                description: '以 / 开头和结尾，例如 /guides/how-to-design-an-ita-bag/。前台按此路径生成页面',
              },
            },
            {
              name: 'pageType',
              type: 'select',
              label: '页面类型',
              defaultValue: 'guide',
              options: [
                { label: '分类页', value: 'category' },
                { label: '商业页', value: 'commercial' },
                { label: '产品页', value: 'product' },
                { label: '定制页', value: 'customization' },
                { label: '组件页', value: 'component' },
                { label: '材质页', value: 'material' },
                { label: '应用场景', value: 'application' },
                { label: '设计灵感', value: 'design_inspiration' },
                { label: '对比页', value: 'comparison' },
                { label: '指南', value: 'guide' },
                { label: '图库', value: 'gallery' },
                { label: '社区话题', value: 'community_topic' },
              ],
            },
            { name: 'excerpt', type: 'textarea', label: '摘要', localized: true },
            { name: 'legacyHeroSummary', type: 'textarea', label: '旧站导语' },
            { name: 'legacyPrimaryKeyword', type: 'text', label: '旧站主关键词' },
            { name: 'heroImage', type: 'upload', relationTo: 'media', label: '头图' },
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              label: '关联产品',
            },
            {
              name: 'relatedPages',
              type: 'relationship',
              relationTo: 'pages',
              hasMany: true,
              label: '相关页面',
            },
          ],
        },
        {
          label: '正文',
          fields: [
            {
              name: 'body',
              type: 'richText',
              label: '正文',
              localized: true,
            },
            {
              name: 'legacyBody',
              type: 'json',
              label: '旧站正文区块',
              admin: { description: '从旧站 content_pages.body 导入：{heading, paragraphs, bullets}[]' },
            },
            {
              name: 'legacyInternalLinks',
              type: 'json',
              label: '旧站内链',
              admin: { description: '从旧站 content_pages.internal_links 导入：{label, slug}[]' },
            },
            {
              name: 'faq',
              type: 'array',
              label: '常见问题',
              admin: { description: '会输出为 FAQ 结构化数据，有助于搜索结果展示' },
              fields: faqItemFields,
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
        { label: 'AI', fields: [aiField] },
      ],
    },
  ],
}
