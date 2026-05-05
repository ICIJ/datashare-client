import { uniqueId } from 'lodash'
import { win32 } from 'path'

export default class RawDocBuilder {
  constructor(path = uniqueId('/path/to/document/'), index = 'default-index') {
    this._id = path
    this._index = index
    this._source = {
      type: 'Document',
      path,
      dirname: win32.dirname(path),
      join: { name: 'Document' },
      language: 'ENGLISH',
      title: path,
      titleNorm: path.normalize('NFD').toLowerCase(),
      extractionLevel: 0,
      nerTags: [],
      metadata: {
        tika_metadata_resourcename: path,
        tika_metadata_another_metadata: null,
        tika_metadata_content_type: null,
        tika_metadata_dcterms_created: null,
        tika_metadata_dc_creator: null
      }
    }
  }

  withContent(content) {
    this._source.content = content
    this._source.contentTextLength = content.length
    return this
  }

  withContentLength(contentLength) {
    this._source.contentLength = contentLength
    return this
  }

  withContentType(contentType) {
    this._source.metadata.tika_metadata_content_type = contentType
    this._source.contentType = contentType.split(';')[0].trim()
    if (contentType.indexOf('charset') > 0) {
      this._source.contentEncoding = contentType.split('=')[1].trim()
    }
    return this
  }

  withIndexingDate(indexingDate) {
    this._source.extractionDate = indexingDate
    return this
  }

  withResourceName(resourceName) {
    this._source.metadata.tika_metadata_resourcename = resourceName
    return this
  }

  withAuthor(author) {
    this._source.metadata.tika_metadata_dc_creator = author
    return this
  }

  withCreationDate(creationDate) {
    this._source.metadata.tika_metadata_dcterms_created = creationDate
    return this
  }

  withOtherMetadata(otherMetadata) {
    this._source.metadata.tika_metadata_another_metadata = otherMetadata
    return this
  }

  withMetadata(metadata) {
    const md = (metadata !== null && typeof metadata === 'object') ? metadata : {}
    this._source.metadata = { ...md, ...this._source.metadata }
    return this
  }

  withLanguage(language) {
    this._source.language = language
    return this
  }

  withNoContentTranslated() {
    this._source.content_translated = []
    return this
  }

  withContentTranslated(content, sourceLanguage, targetLanguage) {
    const translation = { content, source_language: sourceLanguage, target_language: targetLanguage }
    this._source.content_translated ||= []
    this._source.content_translated.push(translation)
    return this
  }

  // NER detail lives in separate ES child documents, not in the document _source.
  // This method is a no-op for the raw shape; withPipeline() sets the nerTags field.
  withNer(_mention, _offset, _category, _isHidden) {
    return this
  }

  withParent(parentId) {
    this._source.parentDocument = parentId
    this._source.extractionLevel = 1
    return this
  }

  withRoot(rootId) {
    this._source.rootDocument = rootId
    return this
  }

  withPipeline(pipeline) {
    this._source.nerTags.push(pipeline)
    return this
  }

  withTags(tags) {
    this._source.tags = tags
    return this
  }

  toRaw() {
    return { _id: this._id, _index: this._index, _source: { ...this._source } }
  }

  static build(path, index) {
    return new RawDocBuilder(path, index)
  }
}
