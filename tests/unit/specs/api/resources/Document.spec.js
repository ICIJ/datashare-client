import Document from '@/api/resources/Document'

describe('Document', () => {
  it('should display tags', () => {
    const doc = new Document({ _source: { tags: ['tag_01', 'tag_02'] } })
    expect(doc.tags).toEqual(['tag_01', 'tag_02'])
  })

  describe('check if a document is a tweet', () => {
    it('should be a tweet', () => {
      const doc = new Document({ _source: { contentType: 'application/json; twint' } })
      expect(doc.isTweet).toBeTruthy()
    })

    it('should NOT be a tweet', () => {
      const doc = new Document({ _source: { contentType: 'everything else' } })
      expect(doc.isTweet).toBeFalsy()
    })
  })

  describe('should generate the title according to document type', () => {
    it('should return the first 10 characters of the id, for default document without any path', () => {
      const doc = new Document({ _id: '01234567890123456789' })
      expect(doc.title).toBe('0123456789')
    })

    it('should return the file name of the path if any, for default document', () => {
      const doc = new Document({ _id: '01234567890123456789', _source: { path: '/this/is/a/specific.file' } })
      expect(doc.title).toBe('specific.file')
    })

    it('should return the dc_title if it is an email that has no subject', () => {
      const doc = new Document({
        _id: '01234567890123456789',
        _source: {
          path: '/this/is/a/specific.file',
          contentType: 'message/orNot',
          metadata: {
            tika_metadata_dc_title: 'This is a nice title'
          }
        }
      })
      expect(doc.title).toBe('This is a nice title')
    })

    it('should return the subject if it is an email', () => {
      const doc = new Document({
        _id: '01234567890123456789',
        _source: {
          path: '/this/is/a/specific.file',
          contentType: 'message/orNot',
          metadata: {
            tika_metadata_dc_title: 'This is a nice title',
            tika_metadata_subject: 'This is an even better title'
          }
        }
      })
      expect(doc.title).toBe('This is an even better title')
    })

    it('should return the dc_title if it is a tweet', () => {
      const doc = new Document({
        _id: '01234567890123456789',
        _source: {
          path: '/this/is/a/specific.file',
          contentType: 'application/json; twint',
          metadata: {
            tika_metadata_dc_title: 'This is a nice tweet title'
          }
        }
      })
      expect(doc.title).toBe('This is a nice tweet title')
    })

    it('should return the resourceName if extractionLevel is superior to 0', () => {
      const doc = new Document({
        _id: '01234567890123456789',
        _source: {
          path: '/this/is/a/specific.file',
          contentType: 'application/json; twint',
          metadata: {
            tika_metadata_dc_title: 'This is a nice tweet title',
            tika_metadata_resourcename: 'simply a resourceName'
          },
          extractionLevel: 1
        }
      })
      expect(doc.title).toBe('simply a resourceName')
    })

    it('should return "extracted" resourceName if extractionLevel > 0 and resourceName starts with "=?" and ends with "?="', () => {
      const doc = new Document({
        _id: '01234567890123456789',
        _source: {
          path: '/this/is/a/specific.file',
          contentType: 'application/json; twint',
          metadata: {
            tika_metadata_dc_title: 'This is a nice tweet title',
            tika_metadata_resourcename: '=?and?something?else?but a resourceName?='
          },
          extractionLevel: 1
        }
      })
      expect(doc.title).toBe('but a resourceName')
    })
  })

  it('should return "unknown" if no document size', () => {
    const doc = new Document({ _id: '42' })

    expect(doc.humanSize).toBe('unknown')
  })

  it('should generate the document url', () => {
    const doc = new Document({ _id: '42', _index: 'project', _routing: '12' })

    expect(doc.fullUrl).toBe('http://localhost:9009/api/project/documents/src/42?routing=12')
  })

  it('should generate the document parent url', () => {
    const doc = new Document({ _id: '42', _index: 'project', _routing: '12' })

    expect(doc.fullParentUrl).toBe('http://localhost:9009/api/project/documents/src/12?routing=12')
  })
})
