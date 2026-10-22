import type { CollectionConfig } from 'payload'
import { seoField } from '../fields/shared'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: '产品分类', plural: '产品分类' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'sort', 'updatedAt'],
    group: '内容',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'name', type: 'text', label: '名称', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      label: 'URL 别名',
      required: true,
      unique: true,
      index: true,
      admin: { description: '小写字母、数字与连字符，例如 mini-ita-bag' },
    },
    { name: 'description', type: 'textarea', label: '描述', localized: true },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: '上级分类',
    },
    { name: 'cover', type: 'upload', relationTo: 'media', label: '分类封面' },
    {
      name: 'sort',
      type: 'number',
      label: '排序',
      defaultValue: 10,
      admin: { description: '数值越小越靠前' },
    },
    seoField,
  ],
}
