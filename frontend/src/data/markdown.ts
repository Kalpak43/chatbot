interface MarkdownRule {
  exp: RegExp;
  replace: RegExp;
  split?: RegExp;
}

interface MarkdownRegex {
  [key: string]: MarkdownRule;
}

export const markdownRegex: MarkdownRegex = {
  ul: {
    exp: /^[\-\*\+]\s(.+)$/,
    replace: /^[\-\*\+]\s/,
  },
  ol: {
    exp: /^\d+\.\s(.+)$/,
    replace: /^\d+\.\s/,
  },
  ">": {
    exp: /^>\s(.*)/,
    replace: /^>\s/,
  },
  "#": {
    exp: /^#\s(.*)/,
    replace: /^#\s/,
  },
  "##": {
    exp: /^##\s(.*)/,
    replace: /^##\s/,
  },
  "###": {
    exp: /^###\s(.*)/,
    replace: /^###\s/,
  },
  "####": {
    exp: /^####\s(.*)/,
    replace: /^####\s/,
  },
  "#####": {
    exp: /^#####\s(.*)/,
    replace: /^#####\s/,
  },
  "######": {
    exp: /^######\s(.*)/,
    replace: /^######\s/,
  },
  "*": {
    exp: /\*(.*)\*/,
    replace: /\*(.*)\*/,
    split: /(\*.*?\*)/,
  },
  "**": {
    exp: /\*\*(.*)\*\*/,
    replace: /\*\*(.*)\*\*/,
    split: /(\*\*.*?\*\*)/,
  },
  "~~": {
    exp: /\~\~(.*?)\~\~/,
    replace: /\~\~(.*?)\~\~/,
    split: /(\~\~.*?\~\~)/,
  },
  "`": {
    exp: /\`(.*?)\`/,
    replace: /\`(.*?)\`/,
    split: /(\`.*?\`)/,
  },
  "---": {
    exp: /^\-\-\-(\s.*)?$/,
    replace: /^\-\-\-(\s.*)?$/,
  },
};
