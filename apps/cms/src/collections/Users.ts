import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: '用户', plural: '用户' },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
    group: '系统',
  },
  fields: [
    { name: 'name', type: 'text', label: '姓名' },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      defaultValue: 'editor',
      options: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '审核', value: 'reviewer' },
      ],
      admin: { description: '角色用于后续权限细分，当前阶段所有登录用户权限一致' },
    },
  ],
}
