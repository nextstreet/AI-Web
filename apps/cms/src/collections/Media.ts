import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '媒体', plural: '媒体库' },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
    group: '内容',
    description: '产品图、场景图与社交分享图统一在这里上传',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'large', width: 1600 },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文本',
      required: true,
      localized: true,
      admin: { description: '图片内容的简短描述，影响无障碍与图片搜索' },
    },
    { name: 'caption', type: 'text', label: '图注', localized: true },
  ],
}
