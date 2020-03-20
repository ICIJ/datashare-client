import IdentityPipeline from './IdentityPipeline'

class DeleteEmptyParagraphsPipeline extends IdentityPipeline {
  apply (value) {
    return value.replace(new RegExp('<p>\s*<\/p>', 'gm'), '')
  }
}

export default DeleteEmptyParagraphsPipeline
