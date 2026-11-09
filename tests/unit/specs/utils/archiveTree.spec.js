import Document from '@/api/resources/Document'
import { findArchiveMatches, getEntryName, toArchiveTree } from '@/utils/archiveTree'

function doc(id, title, metadata = {}) {
  return new Document({ _id: id, _index: 'idx', _source: { title, metadata } })
}

function ids(documents) {
  return documents.map(({ id }) => id)
}

describe('archiveTree', () => {
  it('puts documents without folder metadata at the root', () => {
    const tree = toArchiveTree([doc('1', 'a.txt')])
    expect(tree.folders).toEqual([])
    expect(ids(tree.documents)).toEqual(['1'])
  })

  it('nests PST mail items by folder path', () => {
    const metadata = { tika_metadata_pst_folderpath: '/Top of Outlook data file/Inbox' }
    const tree = toArchiveTree([doc('1', 'Hello', metadata)])
    const [top] = tree.folders
    expect(top.name).toBe('Top of Outlook data file')
    expect(top.folders[0].name).toBe('Inbox')
    expect(top.folders[0].path).toBe('Top of Outlook data file/Inbox')
    expect(ids(top.folders[0].documents)).toEqual(['1'])
  })

  it('keeps backslashes inside PST folder names', () => {
    const tree = toArchiveTree([doc('1', 'm', { tika_metadata_pst_folderpath: '/Inbox/a\\b' })])
    const [inbox] = tree.folders
    expect(inbox.name).toBe('Inbox')
    expect(inbox.folders).toHaveLength(1)
    expect(inbox.folders[0].name).toBe('a\\b')
  })

  it('nests ZIP entries by resource name dirname', () => {
    const tree = toArchiveTree([doc('1', 'q1.pdf', { tika_metadata_resourcename: 'reports/2024/q1.pdf' })])
    const [reports] = tree.folders
    expect(reports.name).toBe('reports')
    expect(reports.folders[0].name).toBe('2024')
    expect(reports.folders[0].path).toBe('reports/2024')
    expect(ids(reports.folders[0].documents)).toEqual(['1'])
  })

  it('prefers PST folder path over resource name', () => {
    const metadata = { tika_metadata_pst_folderpath: '/Inbox', tika_metadata_resourcename: 'x/y.eml' }
    const tree = toArchiveTree([doc('1', 'y', metadata)])
    expect(tree.folders.map(({ name }) => name)).toEqual(['Inbox'])
  })

  it('ignores empty, dot and backslash noise in paths', () => {
    const tree = toArchiveTree([
      doc('1', 'f1', { tika_metadata_resourcename: '/a//b/f1.txt' }),
      doc('2', 'f2', { tika_metadata_resourcename: './a/b/f2.txt' }),
      doc('3', 'f3', { tika_metadata_resourcename: 'a\\b\\f3.txt' }),
      doc('4', 'f4', { tika_metadata_resourcename: 'a/b/' })
    ])
    expect(tree.folders).toHaveLength(1)
    expect(tree.folders[0].name).toBe('a')
    expect(tree.folders[0].folders).toHaveLength(1)
    expect(tree.folders[0].folders[0].name).toBe('b')
    expect(ids(tree.folders[0].folders[0].documents)).toEqual(['1', '2', '3', '4'])
  })

  it('keeps folders with the same name at different depths apart', () => {
    const tree = toArchiveTree([
      doc('1', 'f1', { tika_metadata_resourcename: 'a/x/f1' }),
      doc('2', 'f2', { tika_metadata_resourcename: 'x/f2' })
    ])
    expect(tree.folders.map(({ name }) => name)).toEqual(['a', 'x'])
    expect(tree.folders[0].folders[0].path).toBe('a/x')
    expect(tree.folders[1].path).toBe('x')
  })

  it('sorts folders and documents by name', () => {
    const tree = toArchiveTree([
      doc('1', 'f', { tika_metadata_resourcename: 'b/f' }),
      doc('2', 'f', { tika_metadata_resourcename: 'a/f' }),
      doc('3', 'z.txt'),
      doc('4', 'A.txt')
    ])
    expect(tree.folders.map(({ name }) => name)).toEqual(['a', 'b'])
    expect(tree.documents.map(({ title }) => title)).toEqual(['A.txt', 'z.txt'])
  })

  it('returns an empty root for no documents', () => {
    expect(toArchiveTree([])).toEqual({ name: '', path: '', folders: [], documents: [] })
  })

  it('decodes MIME-encoded resource names before splitting them', () => {
    const tree = toArchiveTree([doc('1', 'file.pdf', { tika_metadata_resourcename: '=?UTF-8?Q?dir/file.pdf?=' })])
    expect(tree.folders.map(({ name }) => name)).toEqual(['dir'])
  })

  it('trims resource names before splitting them', () => {
    const tree = toArchiveTree([doc('1', 'f.txt', { tika_metadata_resourcename: ' a/f.txt ' })])
    expect(tree.folders.map(({ name }) => name)).toEqual(['a'])
  })

  it('sorts documents by entry name', () => {
    const tree = toArchiveTree([
      doc('1', 'a/z.txt', { tika_metadata_resourcename: 'a/z.txt' }),
      doc('2', 'a/b.txt', { tika_metadata_resourcename: 'a/b.txt' })
    ])
    expect(ids(tree.folders[0].documents)).toEqual(['2', '1'])
  })

  describe('getEntryName', () => {
    it('returns the last segment of a resource name with folders', () => {
      const entry = doc('1', 'reports/2024/q1.pdf', { tika_metadata_resourcename: 'reports/2024/q1.pdf' })
      expect(getEntryName(entry)).toBe('q1.pdf')
    })

    it('returns the title when the resource name has no folder', () => {
      const entry = doc('1', 'Hello', { tika_metadata_resourcename: 'message.eml', tika_metadata_pst_folderpath: '/Inbox' })
      expect(getEntryName(entry)).toBe('Hello')
    })
  })

  describe('findArchiveMatches', () => {
    const tree = () => toArchiveTree([
      doc('1', 'reports/q1.pdf', { tika_metadata_resourcename: 'reports/q1.pdf' }),
      doc('2', 'reports/2024/Q1-draft.txt', { tika_metadata_resourcename: 'reports/2024/Q1-draft.txt' }),
      doc('3', 'q1/notes.txt', { tika_metadata_resourcename: 'q1/notes.txt' }),
      doc('4', 'élan.txt', { tika_metadata_resourcename: 'élan.txt' })
    ])

    it('finds folders and files in display order, ignoring case', () => {
      const matches = findArchiveMatches(tree(), 'q1')
      expect(matches.map(({ type, path, id }) => `${type}:${path ?? id}`)).toEqual([
        'folder:q1',
        'document:2',
        'document:1'
      ])
    })

    it('ignores accents', () => {
      expect(findArchiveMatches(tree(), 'elan').map(({ id }) => id)).toEqual(['4'])
    })

    it('gives each match the folders to open and its position in its folder', () => {
      const [draft] = findArchiveMatches(tree(), 'draft')
      expect(draft).toEqual(expect.objectContaining({ type: 'document', id: '2', folderPath: 'reports/2024', index: 0, ancestors: ['reports', 'reports/2024'] }))
    })

    it('finds nothing for a blank term', () => {
      expect(findArchiveMatches(tree(), '  ')).toEqual([])
    })
  })
})
