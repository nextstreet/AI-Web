import type { GlobalConfig } from 'payload'

/** 站点级配置：品牌、导航、主题与默认 SEO */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '站点设置',
  admin: {
    group: '系统',
    description: '全站共享的配置项，修改后前台重新构建即可生效',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '品牌',
          fields: [
            { name: 'brandName', type: 'text', label: '站点名称', required: true },
            { name: 'tagline', type: 'text', label: '标语', localized: true },
            { name: 'footerText', type: 'text', label: '页脚文字', localized: true },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
            { name: 'contactEmail', type: 'email', label: '联系邮箱' },
          ],
        },
        {
          label: '导航',
          fields: [
            {
              name: 'nav',
              type: 'array',
              label: '导航项',
              fields: [
                { name: 'label', type: 'text', label: '显示文本', required: true, localized: true },
                { name: 'href', type: 'text', label: '链接', required: true },
                { name: 'external', type: 'checkbox', label: '外部链接', defaultValue: false },
              ],
            },
          ],
        },
        {
          label: '主题',
          fields: [
            {
              name: 'theme',
              type: 'group',
              label: '配色',
              fields: [
                { name: 'primaryColor', type: 'text', label: '主色', defaultValue: '#1f5c4a' },
                { name: 'accentColor', type: 'text', label: '强调色', defaultValue: '#c98a3c' },
                { name: 'surfaceColor', type: 'text', label: '卡片底色', defaultValue: '#ffffff' },
                { name: 'pageColor', type: 'text', label: '页面底色', defaultValue: '#f6f4ef' },
                { name: 'textColor', type: 'text', label: '正文颜色', defaultValue: '#1c1b19' },
              ],
            },
          ],
        },
        {
          label: 'SEO 默认值',
          fields: [
            {
              name: 'seoDefaults',
              type: 'group',
              label: '默认值',
              fields: [
                { name: 'titleSuffix', type: 'text', label: '标题后缀', localized: true },
                { name: 'defaultDescription', type: 'textarea', label: '默认描述', localized: true },
                { name: 'defaultImage', type: 'upload', relationTo: 'media', label: '默认分享图' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
