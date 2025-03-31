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
  "code": {
    exp: /^```([a-zA-Z]*)?$|^```$/, // matches only opening or closing backticks
    replace: /^```([a-zA-Z]*)?$|^```$/,
    split: /(^```[a-zA-Z]*?[\s\S]*?```$)/m,
  },
  indent: {
    exp: /^(?: {4}|\t).*$/m,
    replace: /^(?: {4}|\t)/,
  },
};
