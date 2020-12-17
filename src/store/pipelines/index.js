export { default as IdentityPipeline } from './IdentityPipeline'
export { default as SimplePipeline } from './SimplePipeline'
export { default as AddGlobalSearchMarks } from './AddGlobalSearchMarks'
export { default as AddNamedEntitiesPipeline } from './AddNamedEntitiesPipeline'
export { default as AddLineBreaksPipeline } from './AddLineBreaksPipeline'
export { default as DeleteEmptyParagraphsPipeline } from './DeleteEmptyParagraphsPipeline'
export { default as AddLabelComponents } from './AddLabelComponents'
export { default as SanitizeHtml } from './SanitizeHtml'

export default [
  { name: 'extracted-text-named-entities', type: 'AddNamedEntitiesPipeline', category: 'extracted-text:pre' },
  { name: 'extracted-text-sanitize-html', type: 'SanitizeHtml', category: 'extracted-text:pre' },
  { name: 'extracted-text-global-search-marks', type: 'AddGlobalSearchMarks', category: 'extracted-text:post' },
  { name: 'extracted-text-line-break', type: 'AddLineBreaksPipeline', category: 'extracted-text:post' },
  { name: 'extracted-text-delete-empty-p', type: 'DeleteEmptyParagraphsPipeline', category: 'extracted-text:post' },
  { name: 'document-view-tabs-with-label-components', type: 'AddLabelComponents', category: 'document-view-tabs:post' }
]
