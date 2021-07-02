import { filter, inRange, some, sortBy } from 'lodash'

export class TextChunk {
  constructor ({ content = '', start = 0, length = 0, previousChunk = null, ...data } = { }) {
    this.content = content
    this.end = start + length
    this.start = start
    this.previousChunk = previousChunk
    this.data = data || {}
  }

  highlight (iterator = null) {
    if (iterator) {
      return iterator({ ...this.data, content: this.content })
    }
    return `<mark>${this.content}</mark>`
  }

  get isFirstChunk () {
    return !this.previousChunk
  }

  set previousChunk (previousChunk) {
    if (previousChunk) {
      this._previousChunk = previousChunk
      previousChunk.nextChunk = this
    }
  }

  get previousChunk () {
    return this._previousChunk || null
  }
}

export class Highlight {
  constructor ({ content = '', each = null } = {}) {
    this.content = content
    this.each = each
  }

  cleanRanges (ranges = []) {
    ranges = sortBy(ranges, ['start', 'length'])
    // Remove overlaping ranges
    ranges = filter(ranges, (range, i) => {
      const previousRanges = ranges.slice(0, i)
      // Look into previous ranges to ensure none is overlaping
      return !some(previousRanges, ({ start, length }) => {
        // It starts in the current range
        return inRange(start, range.start - 1, range.start + range.length + 1) ||
        // Or it end in the current range
        inRange(start + length, range.start - 1, range.start + range.length + 1)
      })
    })
    return ranges
  }

  ranges (ranges = []) {
    let textChunk = new TextChunk()
    this.cleanRanges(ranges).forEach(({ start, length, ...data }) => {
      const end = start + length
      const content = this.content.substring(start, end)
      textChunk = new TextChunk({ ...data, content, length, previousChunk: textChunk, start })
    })
    // Start fill the content with the text following the last chunk
    let content = this.content.substring(textChunk.end)
    // Iterate until the first chunk
    while (!textChunk.isFirstChunk) {
      // Get the text between this chunk and the previous chunk
      const intermediateContent = this.content.substring(textChunk.previousChunk.end, textChunk.start)
      // Concatenate the 3 chunks, including the highlighted one
      content = intermediateContent + textChunk.highlight(this.each) + content
      // Switch chunks to iterate to the next
      textChunk = textChunk.previousChunk
    }
    return content
  }

  static create (...args) {
    return new Highlight(...args)
  }
}
