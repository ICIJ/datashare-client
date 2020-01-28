import find from 'lodash/find'
import isArray from 'lodash/isArray'
import uniqueId from 'lodash/uniqueId'
import { dirname } from 'path'

import Response from '@/api/resources/Response'

function letData (index) {
  return new IndexBuilder(index)
}

class IndexedNe {
  constructor (mention, offset = 1, category = 'ORGANIZATION', isHidden = false) {
    this.mention = mention
    this.offset = offset
    this.category = category
    this.isHidden = isHidden
  }
  get id () {
    return this.mention + this.offset
  }
}

class IndexedDocuments {
  constructor () {
    this.baseName = 'document'
    this.numberOfDocuments = 0
    this.content = 'default content'
    this.document = []
    this.index = 'default-index'
  }
  setBaseName (pattern) {
    this.baseName = pattern
    return this
  }
  withContent (content) {
    this.content = content
    return this
  }
  withIndex (index) {
    this.index = index
    return this
  }
  withIndexingDate (indexingDate) {
    this.extractionDate = indexingDate
    return this
  }
  count (numberOfDocuments) {
    this.numberOfDocuments = numberOfDocuments
    for (let i = 0; i < this.numberOfDocuments; i++) {
      let doc = new IndexedDocument(this.baseName + '_' + (i + 1), this.index).withContent(this.content)
      if (this.extractionDate) {
        doc.withIndexingDate(this.extractionDate[i])
      }
      this.document.push(doc)
    }
    return this.document
  }
}

class IndexedDocument {
  constructor (path = uniqueId('/path/to/document/'), index = 'default-index') {
    this.path = path
    this.dirname = dirname(path)
    this.join = { name: 'Document' }
    this.type = 'Document'
    this.metadata = {
      tika_metadata_another_metadata: null,
      tika_metadata_content_type: null,
      tika_metadata_creation_date: null
    }
    this.nerList = []
    this.nerTags = []
    this.index = index
  }
  withContent (content) {
    this.content = content
    return this
  }
  withContentType (contentType) {
    this.metadata.tika_metadata_content_type = contentType
    this.contentType = contentType.split(';')[0].trim()
    if (contentType.indexOf('charset') > 0) {
      this.contentEncoding = contentType.split('=')[1].trim()
    }
    return this
  }
  withIndexingDate (indexingDate) {
    this.extractionDate = indexingDate
    return this
  }
  withCreationDate (creationDate) {
    this.metadata.tika_metadata_creation_date = creationDate
    return this
  }
  withMetadata (metadata) {
    this.metadata.tika_metadata_another_metadata = metadata
    return this
  }
  withLanguage (language) {
    this.language = language
    return this
  }
  withNer (mention, offset = 1, category = 'PERSON', isHidden = false) {
    this.nerList.push(new IndexedNe(mention, offset, category, isHidden))
    return this
  }
  withParent (parentId) {
    this.parentDocument = parentId
    this.extractionLevel = 1
    return this
  }
  withPipeline (pipeline) {
    this.nerTags.push(pipeline)
    return this
  }
  withTags (tags) {
    this.tags = tags
    return this
  }
  hasParent () {
    return this.parentDocument !== undefined
  }
  hideNer (mention) {
    let ner = find(this.nerList, { mention: mention })
    ner.isHidden = true
    return ner
  }
}

class IndexBuilder {
  constructor (index) {
    this.index = index
    this.committedDocumentIds = []
  }
  have (document) {
    this.document = document
    return this
  }
  async hideNer (mention) {
    await this.update(await this.document.hideNer(mention))
    return this
  }
  async update (ner) {
    await this.index.update({
      index: process.env.VUE_APP_ES_INDEX,
      type: 'doc',
      refresh: true,
      id: ner.id,
      body: {
        doc: {
          isHidden: ner.isHidden
        }
      }
    })
  }
  async commit () {
    if (isArray(this.document)) {
      // Copy this array into 'documents' because 'document'
      // will be overwritten by the next call to have
      this.documents = this.document
      for (const doc of this.documents) {
        await this.have(doc).commit()
      }
    } else {
      const docId = this.document.path
      const index = this.document.index
      let createRequest = {
        index: index,
        type: 'doc',
        refresh: true,
        id: docId,
        body: this._omit(this.document, ['nerList'])
      }
      if (this.document.hasParent()) {
        createRequest.routing = this.document.parentDocument
      }
      const { _id } = await this.index.create(createRequest)
      this.committedDocumentIds.push(_id)
      for (let i = 0; i < this.document.nerList.length; i++) {
        let ner = this.document.nerList[i]
        await this.index.create({
          index: index,
          type: 'doc',
          refresh: true,
          id: ner.id,
          routing: docId,
          body: {
            mention: ner.mention,
            mentionNorm: ner.mention,
            offset: ner.offset,
            category: ner.category,
            isHidden: ner.isHidden,
            type: 'NamedEntity',
            join: { name: 'NamedEntity', parent: docId }
          }
        })
      }
    }
    return this
  }
  async commitAndGetLastDocument () {
    await this.commit()
    return this.lastCommittedDocument
  }
  _omit (obj, fields) {
    return Object.keys(obj).reduce((newObj, key) => {
      if (!fields.includes(key)) {
        newObj[key] = obj[key]
      }
      return newObj
    }, {})
  }
  get committedDocuments () {
    const promises = this.committedDocumentIds.map(async id => {
      const raw = await this.index.get({ index: this.document.index, type: 'doc', id })
      return Response.instantiate(raw)
    })
    return Promise.all(promises)
  }
  get lastCommittedDocument () {
    return Promise.resolve().then(async () => {
      const id = this.committedDocumentIds.slice(-1).pop()
      const raw = await this.index.get({ index: this.document.index, type: 'doc', id })
      return Response.instantiate(raw)
    })
  }
}

export { letData, IndexBuilder, IndexedDocuments, IndexedDocument, IndexedNe }
