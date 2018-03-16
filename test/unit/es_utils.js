function letData (index) {
  return new IndexBuilder(index)
}

class IndexedNe {
  constructor (mention, offset) {
    this.mention = mention
    this.offset = offset
  }
}

class IndexedDocument {
  constructor (path) {
    this.path = path
    this.join = {name: 'Document'}
    this.type = 'Document'
    this.metadata = {}
    this.nerList = []
  }
  withContent (content) {
    this.content = content
    return this
  }
  withNer (mention, offset = 1) {
    this.nerList.push(new IndexedNe(mention, offset))
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
    var docId = this.document.path
    let createRequest = {
      index: process.env.CONFIG.es_index,
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
        index: process.env.CONFIG.es_index,
        type: 'doc',
        refresh: true,
        id: ner.mention + ner.offset,
        routing: docId,
        body: {
          mention: ner.mention,
          mentionNorm: ner.mention,
          offset: ner.offset,
          type: 'NamedEntity',
          join: {name: 'NamedEntity', parent: docId}
        }
      })
    }
  }
}

export {letData, IndexBuilder, IndexedDocument, IndexedNe}
