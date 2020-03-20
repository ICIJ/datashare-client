export { default as IdentityPipeline } from './IdentityPipeline'
export { default as SimplePipeline } from './SimplePipeline'
export { default as AddLineBreaksPipeline } from './AddLineBreaksPipeline'
export { default as DeleteEmptyParagraphsPipeline } from './DeleteEmptyParagraphsPipeline'

export default [
  { name: 'extracted-text-line-break', type: 'AddLineBreaksPipeline', category: 'extracted-text:post' },
  { name: 'extracted-text-delete-empty-p', type: 'DeleteEmptyParagraphsPipeline', category: 'extracted-text:post' }
]
