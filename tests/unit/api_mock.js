function letTextContent (content) {
  return new TextContent(content)
}
class TextContent {
  constructor (content) {
    this.content = content ?? ''
    this.offset = 0
    this.limit = this.content.length
    this.maxOffset = this.content.length
  }
  withContent (content) {
    this.content = content
    this.limit = this.content.length
    this.maxOffset = content.length
    return this
  }
  withOffset (offset) {
    this.offset = offset
    return this
  }
  withLimit (limit) {
    this.limit = limit
    return this
  }
  withMaxOffset (maxOffset) {
    this.maxOffset = maxOffset
    return this
  }
  getResponse () {
    return { content: this.content, limit: this.limit, offset: this.offset, maxOffset: this.maxOffset }
  }
}
export { letTextContent, TextContent }
