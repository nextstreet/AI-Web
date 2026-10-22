type LexicalNode = {
  type?: string;
  text?: string;
  format?: number;
  tag?: string;
  listType?: string;
  url?: string;
  fields?: { url?: string; newTab?: boolean };
  children?: LexicalNode[];
};

const allowedTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote']);

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeHref(value: string): string | undefined {
  return /^(?:\/|https?:\/\/|mailto:|tel:)/.test(value) ? value : undefined;
}

/** Lexical 文本节点的 format 是位掩码：1 粗体、2 斜体、4 删除线、8 下划线、16 行内代码 */
function renderText(node: LexicalNode): string {
  let html = escapeHtml(node.text ?? '');
  const format = node.format ?? 0;
  if (format & 16) html = `<code>${html}</code>`;
  if (format & 1) html = `<strong>${html}</strong>`;
  if (format & 2) html = `<em>${html}</em>`;
  if (format & 4) html = `<s>${html}</s>`;
  if (format & 8) html = `<u>${html}</u>`;
  return html;
}

function renderChildren(node: LexicalNode): string {
  return (node.children ?? []).map(renderNode).join('');
}

function renderNode(node: LexicalNode): string {
  switch (node.type) {
    case 'text':
      return renderText(node);
    case 'linebreak':
      return '<br />';
    case 'horizontalrule':
      return '<hr />';
    case 'paragraph':
      return `<p>${renderChildren(node)}</p>`;
    case 'heading': {
      const tag = node.tag && allowedTags.has(node.tag) ? node.tag : 'h2';
      return `<${tag}>${renderChildren(node)}</${tag}>`;
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul';
      return `<${tag}>${renderChildren(node)}</${tag}>`;
    }
    case 'listitem':
      return `<li>${renderChildren(node)}</li>`;
    case 'quote':
      return `<blockquote>${renderChildren(node)}</blockquote>`;
    case 'link': {
      const href = safeHref(node.fields?.url ?? node.url ?? '');
      if (!href) return renderChildren(node);
      const target = node.fields?.newTab ? ' target="_blank" rel="noreferrer"' : '';
      return `<a href="${escapeHtml(href)}"${target}>${renderChildren(node)}</a>`;
    }
    default:
      return renderChildren(node);
  }
}

/**
 * 把 Payload 的 Lexical 富文本 JSON 转成 HTML。
 * 只处理编辑器中真正会用到的节点，遇到未知节点时递归渲染子节点，不抛错。
 */
export function lexicalToHtml(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const root = (value as { root?: LexicalNode }).root;
  if (!root || !Array.isArray(root.children)) return '';
  return root.children.map(renderNode).join('');
}
