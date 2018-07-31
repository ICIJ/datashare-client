import isArray from 'lodash/isArray'

function letData (index) {
  return new IndexBuilder(index)
}

class IndexedNe {
  constructor (mention, offset, category = 'ORGANIZATION') {
    this.mention = mention
    this.offset = offset
    this.category = category
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
    this.join = {name: 'Document'}
    this.type = 'Document'
    this.metadata = {
      tika_metadata_content_type: null
    }
    this.nerList = []
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
  withNer (mention, offset = 1, category = 'ORGANIZATION') {
    this.nerList.push(new IndexedNe(mention, offset, category))
    return this
  }
  withParent (parentId) {
    this.parentDocument = parentId
    return this
  }
  hasParent () {
    return this.parentDocument !== undefined
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
          id: ner.mention + ner.offset,
          routing: docId,
          body: {
            mention: ner.mention,
            mentionNorm: ner.mention,
            offset: ner.offset,
            category: ner.category,
            type: 'NamedEntity',
            join: {name: 'NamedEntity', parent: docId}
          }
        })
      }
    }
  }
}

export {letData, IndexBuilder, IndexedDocuments, IndexedDocument, IndexedNe}
