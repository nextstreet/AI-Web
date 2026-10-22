import type { CollectionConfig } from 'payload'
import { publishedOrAuthenticated } from '../access'
import { aiField, faqItemsField, seoField } from '../fields/shared'
import { notifyDeployAfterChange } from '../hooks/notifyDeploy'

/**
 * 产品内容模型。
 * 规格参数用 array（可增删行），展现形式用 blocks（可拖拽组合），
 * 这两点正是自建后台最难补齐、而 Payload 开箱即用的部分。
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: '产品', plural: '产品' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', '_status', 'updatedAt'],
    group: '内容',
    description: '独立站产品：基础信息、规格参数、展现形式与 SEO',
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
            { name: 'name', type: 'text', label: '产品名称', required: true, localized: true },
            {
              name: 'slug',
              type: 'text',
              label: 'URL 别名',
              required: true,
              unique: true,
              index: true,
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              label: '所属分类',
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: '一句话简介',
              localized: true,
              admin: { description: '用于列表卡片与搜索结果摘要' },
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media', label: '主图' },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: '产品图集',
            },
            {
              name: 'priceFrom',
              type: 'text',
              label: '起售价',
              admin: { description: '可选。纯展示站可留空' },
            },
            {
              name: 'currency',
              type: 'select',
              label: '币种',
              defaultValue: 'USD',
              options: ['USD', 'EUR', 'GBP', 'CNY'].map((value) => ({ label: value, value })),
            },
            { name: 'leadTime', type: 'text', label: '交期说明', localized: true },
            {
              name: 'tags',
              type: 'array',
              label: '标签',
              fields: [{ name: 'tag', type: 'text', label: '标签', required: true, localized: true }],
            },
          ],
        },
        {
          label: '规格参数',
          fields: [
            {
              name: 'specs',
              type: 'array',
              label: '规格参数表',
              labels: { singular: '参数', plural: '规格参数' },
              admin: { description: '每行一个参数，前端按顺序渲染成表格' },
              fields: [
                { name: 'label', type: 'text', label: '参数名', required: true, localized: true },
                { name: 'value', type: 'text', label: '参数值', required: true, localized: true },
                { name: 'note', type: 'text', label: '备注', localized: true },
              ],
            },
            {
              name: 'highlights',
              type: 'array',
              label: '产品亮点',
              fields: [
                { name: 'title', type: 'text', label: '标题', required: true, localized: true },
                { name: 'text', type: 'textarea', label: '说明', localized: true },
              ],
            },
            {
              name: 'variants',
              type: 'array',
              label: '款式 / 选项',
              fields: [
                { name: 'name', type: 'text', label: '选项组名称', required: true, localized: true },
                {
                  name: 'options',
                  type: 'array',
                  label: '可选值',
                  fields: [
                    { name: 'label', type: 'text', label: '显示文本', required: true, localized: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '展现形式',
          fields: [
            {
              name: 'presentation',
              type: 'blocks',
              label: '页面区块',
              labels: { singular: '区块', plural: '区块' },
              admin: { description: '按需要拼装产品详情的展示结构，可拖拽排序' },
              blocks: [
                {
                  slug: 'richText',
                  labels: { singular: '富文本', plural: '富文本' },
                  fields: [{ name: 'content', type: 'richText', label: '正文', localized: true }],
                },
                {
                  slug: 'imageText',
                  labels: { singular: '图文', plural: '图文' },
                  fields: [
                    { name: 'image', type: 'upload', relationTo: 'media', label: '图片' },
                    { name: 'heading', type: 'text', label: '标题', localized: true },
                    { name: 'body', type: 'textarea', label: '文字', localized: true },
                    {
                      name: 'imagePosition',
                      type: 'select',
                      label: '图片位置',
                      defaultValue: 'left',
                      options: [
                        { label: '左', value: 'left' },
                        { label: '右', value: 'right' },
                      ],
                    },
                  ],
                },
                {
                  slug: 'specTable',
                  labels: { singular: '参数表', plural: '参数表' },
                  fields: [
                    { name: 'title', type: 'text', label: '标题', localized: true },
                    {
                      name: 'rows',
                      type: 'array',
                      label: '表格行',
                      fields: [
                        { name: 'label', type: 'text', label: '名称', required: true, localized: true },
                        { name: 'value', type: 'text', label: '内容', required: true, localized: true },
                      ],
                    },
                  ],
                },
                {
                  slug: 'sizeGuide',
                  labels: { singular: '尺寸指南', plural: '尺寸指南' },
                  fields: [
                    { name: 'title', type: 'text', label: '标题', localized: true },
                    { name: 'image', type: 'upload', relationTo: 'media', label: '尺寸图' },
                    { name: 'notes', type: 'textarea', label: '说明', localized: true },
                  ],
                },
                {
                  slug: 'comparison',
                  labels: { singular: '对比', plural: '对比' },
                  fields: [
                    { name: 'title', type: 'text', label: '标题', localized: true },
                    {
                      name: 'items',
                      type: 'array',
                      label: '对比项',
                      fields: [
                        { name: 'title', type: 'text', label: '名称', required: true, localized: true },
                        { name: 'text', type: 'textarea', label: '说明', localized: true },
                      ],
                    },
                  ],
                },
                {
                  slug: 'faq',
                  labels: { singular: '常见问题', plural: '常见问题' },
                  fields: [
                    { name: 'title', type: 'text', label: '标题', localized: true },
                    faqItemsField,
                  ],
                },
                {
                  slug: 'cta',
                  labels: { singular: '行动号召', plural: '行动号召' },
                  fields: [
                    { name: 'heading', type: 'text', label: '标题', localized: true },
                    { name: 'text', type: 'textarea', label: '说明', localized: true },
                    { name: 'buttonLabel', type: 'text', label: '按钮文字', localized: true },
                    { name: 'buttonHref', type: 'text', label: '按钮链接' },
                  ],
                },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
        { label: 'AI', fields: [aiField] },
      ],
    },
  ],
}
