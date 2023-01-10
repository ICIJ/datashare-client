import IdentityPipeline from './IdentityPipeline'

class DeleteEmptyParagraphsPipeline extends IdentityPipeline {
  apply(value) {
    return value.replace(/<p>\s*<\/p>/gm, '')
  }
}

export default DeleteEmptyParagraphsPipeline
