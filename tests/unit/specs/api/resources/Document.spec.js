import Document from '@/api/resources/Document'

describe('Document', () => {
  describe('display human readable size', () => {
    it('should display human readable size for -1', () => {
      const doc = new Document({ _source: { contentLength: -1 } })
      expect(doc.humanSize).toEqual('unknown')
    })

    it('should display human readable size for 0', () => {
      const doc = new Document({ _source: { contentLength: 0 } })
      expect(doc.humanSize).toEqual('0 B')
    })

    it('should display human readable size for Bytes', () => {
      const doc = new Document({ _source: { contentLength: 12 } })
      expect(doc.humanSize).toEqual('12 B')
    })

    it('should display human readable size for Kilobytes', () => {
      const doc = new Document({ _source: { contentLength: 10342 } })
      expect(doc.humanSize).toEqual('10.10 kB (10342 B)')
    })

    it('should display human readable size for Megabytes', () => {
      const doc = new Document({ _source: { contentLength: 12345678 } })
      expect(doc.humanSize).toEqual('11.77 MB (12345678 B)')
    })
  })

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
            tika_metadata_resourcename: '=?and?somethig?else?but a resourceName?='
          },
          extractionLevel: 1
        }
      })
      expect(doc.title).toBe('but a resourceName')
    })
  })
})
