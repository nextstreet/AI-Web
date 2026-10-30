import type { CollectionConfig } from 'payload'

/** 旧版 ITA ATELIER 的设计概念 / 画廊条目 */
export const Designs: CollectionConfig = {
  slug: 'designs',
  labels: { singular: '设计概念', plural: '设计概念' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'votesCount', 'updatedAt'],
    group: '内容',
    description: '首页概念、画廊投票与设计详情页的数据来源',
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { status: { equals: 'published' } }),
  },
  fields: [
    { name: 'name', type: 'text', label: '名称', required: true },
    { name: 'slug', type: 'text', label: 'Slug', required: true, unique: true, index: true },
    { name: 'status', type: 'select', label: '状态', defaultValue: 'published', options: [
      { label: '草稿', value: 'draft' },
      { label: '已发布', value: 'published' },
      { label: '归档', value: 'archived' },
    ] },
    { name: 'description', type: 'textarea', label: '描述' },
    { name: 'imageUrl', type: 'text', label: '图片地址', defaultValue: '/images/campaign.webp' },
    { name: 'type', type: 'select', label: '包型', options: [
      { label: 'Backpack', value: 'Backpack' },
      { label: 'Crossbody', value: 'Crossbody' },
      { label: 'Tote', value: 'Tote' },
    ] },
    { name: 'color', type: 'text', label: '颜色' },
    { name: 'swatch', type: 'text', label: '色块', defaultValue: '#d7ddd9' },
    { name: 'display', type: 'select', label: '展示物', options: [
      { label: 'Pins', value: 'Pins' },
      { label: 'Photocards', value: 'Photocards' },
    ] },
    { name: 'mood', type: 'select', label: '风格', options: [
      { label: 'Playful', value: 'Playful' },
      { label: 'Soft', value: 'Soft' },
      { label: 'Minimal', value: 'Minimal' },
    ] },
    { name: 'occasion', type: 'select', label: '场景', options: [
      { label: 'Conventions', value: 'Conventions' },
      { label: 'Everyday', value: 'Everyday' },
    ] },
    { name: 'window', type: 'select', label: '窗口形状', options: [
      { label: 'Heart', value: 'Heart' },
      { label: 'Rectangle', value: 'Rectangle' },
    ] },
    { name: 'collectionSize', type: 'select', label: '收藏规模', options: [
      { label: 'Small', value: 'Small' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Large', value: 'Large' },
    ] },
    { name: 'note', type: 'textarea', label: '设计说明' },
    {
      name: 'highlights',
      type: 'array',
      label: '亮点',
      fields: [
        { name: 'title', type: 'text', label: '标题' },
        { name: 'text', type: 'textarea', label: '说明' },
      ],
    },
    {
      name: 'planningPoints',
      type: 'array',
      label: '规划要点',
      fields: [{ name: 'point', type: 'text', label: '要点' }],
    },
    { name: 'tags', type: 'array', label: '标签', fields: [{ name: 'tag', type: 'text', label: '标签' }] },
    { name: 'votesCount', type: 'number', label: '票数', defaultValue: 0, min: 0 },
    { name: 'sort', type: 'number', label: '排序', defaultValue: 0 },
  ],
}
