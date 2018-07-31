import Document from '@/api/Document'

describe('Document', () => {
  it('should display human readable size for -1', () => {
    let doc = new Document({_source: {contentLength: -1}})
    expect(doc.humanSize).toEqual('unknown')
  })

  it('should display human readable size for 0', () => {
    let doc = new Document({_source: {contentLength: 0}})
    expect(doc.humanSize).toEqual('0 B')
  })

  it('should display human readable size for Bytes', () => {
    let doc = new Document({_source: {contentLength: 12}})
    expect(doc.humanSize).toEqual('12 B')
  })

  it('should display human readable size for Kilobytes', () => {
    let doc = new Document({_source: {contentLength: 10342}})
    expect(doc.humanSize).toEqual('10.10 kB (10342 B)')
  })

  it('should display human readable size for Megabytes', () => {
    let doc = new Document({_source: {contentLength: 12345678}})
    expect(doc.humanSize).toEqual('11.77 MB (12345678 B)')
  })

  it('should give relative path of document from data prefix', () => {
    let docFile = new Document({_source: {path: '/a/path/to/data/sub/dir/file.txt'}})
    expect(docFile.relativePath).toEqual('/api/data/sub/dir/file.txt')
  })

  it('should give the original path of document from data prefix if no data string in path', () => {
    let docFile = new Document({_source: {path: '/a/datapath/to/sub/dir/file.txt'}})
    expect(docFile.relativePath).toEqual('/a/datapath/to/sub/dir/file.txt')
  })

  it('should give relative path when data_prefix is not a directory', () => {
    let docFile = new Document({_source: {path: '/datashare/data/file.txt'}})
    expect(docFile.relativePath).toEqual('/api/data/file.txt')
  })
})
