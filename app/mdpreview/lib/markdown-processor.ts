import { MarkdownProcessorOptions } from '../types'

export const defaultProcessorOptions: MarkdownProcessorOptions = {
  enableGfm: true,
  enableEmoji: true,
  enableSyntaxHighlight: true,
  syntaxTheme: 'github'
}

export const remarkPlugins = [
  'remark-gfm',
  'remark-emoji'
]

export const rehypePlugins = [
  'rehype-sanitize'
]

export const syntaxHighlighterThemes = {
  github: 'github',
  'github-dark': 'github-dark',
  vs: 'vs',
  'vs-dark': 'vs-dark'
} as const

export type SyntaxTheme = keyof typeof syntaxHighlighterThemes