import isArray from 'lodash/isArray'
import find from 'lodash/find'
import { dirname } from 'path'

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
    this.baseName = 'doc'
    this.numberOfDocuments = 0
    this.content = 'default content'
    this.document = []
  }
  setBaseName (pattern) {
    this.baseName = pattern
    return this
  }
  withContent (content) {
    this.content = content
    return this
  }
  withIndexingDate (indexingDate) {
    this.extractionDate = indexingDate
    return this
  }
  count (numberOfDocuments) {
    this.numberOfDocuments = numberOfDocuments
    for (var i = 0; i < this.numberOfDocuments; i++) {
      let doc = new IndexedDocument(this.baseName + '_' + (i + 1) + '.txt').withContent(this.content)
      if (this.extractionDate) {
        doc.withIndexingDate(this.extractionDate[i])
      }
      this.document.push(doc)
    }
    return this.document
  }
}

class IndexedDocument {
  constructor (path) {
    this.path = path
    this.dirname = dirname(path)
    this.join = {name: 'Document'}
    this.type = 'Document'
    this.metadata = {
      tika_metadata_content_type: null
    }
    this.nerList = []
    this.nerTags = []
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
  withPipeline (pipeline) {
    this.nerTags.push(pipeline)
    return this
  }
  withNer (mention, offset = 1, category = 'ORGANIZATION', isHidden = false) {
    this.nerList.push(new IndexedNe(mention, offset, category, isHidden))
    return this
  }
  withParent (parentId) {
    this.parentDocument = parentId
    this.extractionLevel = 1
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
    console.log('update')
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
    console.log('end of update')
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
      var docId = this.document.path
      let createRequest = {
        index: process.env.VUE_APP_ES_INDEX,
        type: 'doc',
        refresh: true,
        id: docId,
        body: this.document
      }
      if (this.document.hasParent()) {
        createRequest.routing = this.document.parentDocument
      }
      await this.index.create(createRequest)
      for (var i = 0; i < this.document.nerList.length; i++) {
        let ner = this.document.nerList[i]
        await this.index.create({
          index: process.env.VUE_APP_ES_INDEX,
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
            join: {name: 'NamedEntity', parent: docId}
          }
        })
      }
    }
    return this
  }
}

export {letData, IndexBuilder, IndexedDocuments, IndexedDocument, IndexedNe}
