import DOMPurify from 'dompurify';
import { marked, type TokenizerAndRendererExtension, type Tokens, type Token } from 'marked';

export interface UseMarkdownReturn {
  renderMarkdown: (rawText: string) => string;
  renderTypingHtml: (rawText: string) => string;
}

interface RoleToken extends Tokens.Generic {
  type: 'roleDialogue';
  raw: string;
  openQ: string;
  role: string;
  content: string;
  tokens: Token[];
}

interface SystemTagToken extends Tokens.Generic {
  type: 'systemTags';
  raw: string;
}

const quoteMap: Record<string, string> = {
  "'": "'",
  '"': '"',
  '‘': '’',
  '“': '”',
  '『': '』',
  '「': '」',
};

const systemTagsExtension: TokenizerAndRendererExtension = {
  name: 'systemTags',
  level: 'block',
  start(src: string): number | undefined {
    const match = /<状态栏>|\[action:/i.exec(src);
    return match ? match.index : undefined;
  },
  tokenizer(src: string): SystemTagToken | undefined {
    const startMatch = /^(<状态栏>|\[action:)/i.exec(src);
    if (startMatch) {
      const isStatus = startMatch[0].toLowerCase() === '<状态栏>';
      const endTag = isStatus ? '</状态栏>' : ']';

      let endIndex = src.indexOf(endTag, startMatch[0].length);

      if (endIndex === -1) {
        endIndex = src.length;
      } else {
        endIndex += endTag.length;
      }

      return {
        type: 'systemTags',
        raw: src.slice(0, endIndex),
      };
    }
    return undefined;
  },
  renderer(): string {
    return '';
  },
};

const roleDialogueExtension: TokenizerAndRendererExtension = {
  name: 'roleDialogue',
  level: 'inline',
  start(src: string): number | undefined {
    const match = /['"‘“『「]\s*[LQC][:：]/i.exec(src);
    return match ? match.index : undefined;
  },
  tokenizer(src: string): RoleToken | undefined {
    const roleMatch = /^(['"‘“『「])\s*([LQC])[:：]\s*/i.exec(src);
    if (roleMatch) {
      const openQ = roleMatch[1];
      const role = roleMatch[2].toUpperCase();
      const prefixLen = roleMatch[0].length;

      const closeQ = quoteMap[openQ] ?? openQ;

      let endIndex = src.indexOf(closeQ, prefixLen);
      let hasCloseQ = true;

      if (endIndex === -1) {
        endIndex = src.length;
        hasCloseQ = false;
      }

      const content = src.slice(prefixLen, endIndex);
      const rawEnd = hasCloseQ ? endIndex + closeQ.length : endIndex;

      return {
        type: 'roleDialogue',
        raw: src.slice(0, rawEnd),
        openQ,
        role,
        content,
        tokens: this.lexer.inlineTokens(content),
      };
    }
    return undefined;
  },
  renderer(token: Tokens.Generic): string {
    const t = token as RoleToken;
    const roleMap: Record<string, string> = { L: 'msg-lin', Q: 'msg-qin', C: 'msg-children' };

    const cls = roleMap[t.role] ?? '';
    const closeQ = quoteMap[t.openQ] ?? '';

    const innerHtml = this.parser.parseInline(t.tokens);

    return `${t.openQ}<span class="${cls}">${innerHtml}</span>${closeQ}`;
  },
};

marked.use({
  gfm: true,
  breaks: true,
  extensions: [systemTagsExtension, roleDialogueExtension],
});

export function useMarkdown(): UseMarkdownReturn {
  const renderMarkdown = (rawText: string): string => {
    const rawHtml = marked.parse(rawText) as string;
    return DOMPurify.sanitize(rawHtml);
  };

  const renderTypingHtml = (rawText: string): string => {
    const htmlOutput = renderMarkdown(rawText.trim());

    if (htmlOutput.trim().endsWith('</p>')) {
      return htmlOutput.replace(/<\/p>\s*$/, '<span class="typing-cursor"></span></p>');
    } else {
      return htmlOutput + '<span class="typing-cursor"></span>';
    }
  };

  return { renderMarkdown, renderTypingHtml };
}
