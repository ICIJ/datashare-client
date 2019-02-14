import Document from '@/api/Document'

describe('Document', () => {
  it('should display human readable size for -1', () => {
    let doc = new Document({ _source: { contentLength: -1 } })
    expect(doc.humanSize).toEqual('unknown')
  })

  it('should display human readable size for 0', () => {
    let doc = new Document({ _source: { contentLength: 0 } })
    expect(doc.humanSize).toEqual('0 B')
  })

  it('should display human readable size for Bytes', () => {
    let doc = new Document({ _source: { contentLength: 12 } })
    expect(doc.humanSize).toEqual('12 B')
  })

  it('should display human readable size for Kilobytes', () => {
    let doc = new Document({ _source: { contentLength: 10342 } })
    expect(doc.humanSize).toEqual('10.10 kB (10342 B)')
  })

  it('should display human readable size for Megabytes', () => {
    let doc = new Document({ _source: { contentLength: 12345678 } })
    expect(doc.humanSize).toEqual('11.77 MB (12345678 B)')
  })
})
