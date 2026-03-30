import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.use({ gfm: true, breaks: true });

const applyCharacterFonts = (text: string): string => {
  return text.replace(
    /([\'"‘“『「])\s*([LQC])[:：]\s*([\s\S]*?)([\'"’”』」]|$)/g,
    (_match: string, openQ: string, role: string, content: string, closeQ: string) => {
      const roleMap: Record<string, string> = { L: 'msg-lin', Q: 'msg-qin', C: 'msg-children' };
      const cls = roleMap[role.toUpperCase()];
      return `${openQ}<span class="${cls}">${content}</span>${closeQ}`;
    },
  );
};

const stripSystemTags = (text: string): string => {
  return text
    .replace(/<状态栏>[\s\S]*?<\/状态栏>/g, '')
    .replace(/\[action:.*?\]/gi, '')
    .replace(/\{\{setglobalvar::.*?\}\}/gi, '');
};

export function useMarkdown() {
  const renderMarkdown = (rawText: string, isAI = true): string => {
    let text = rawText;
    if (isAI) {
      text = stripSystemTags(text);
      text = applyCharacterFonts(text);
    }

    const rawHtml = marked.parse(text) as string;

    return DOMPurify.sanitize(rawHtml);
  };

  const renderTypingHtml = (rawText: string): string => {
    let htmlOutput = renderMarkdown(rawText.trim(), true);

    if (htmlOutput.trim().endsWith('</p>')) {
      return htmlOutput.replace(/<\/p>\s*$/, '<span class="typing-cursor"></span></p>');
    } else {
      return htmlOutput + '<span class="typing-cursor"></span>';
    }
  };

  return {
    renderMarkdown,
    renderTypingHtml,
  };
}
