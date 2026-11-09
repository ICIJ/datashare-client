import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance as api } from '@/api/apiInstance'
import Document from '@/api/resources/Document'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentViewerArchive from '@/components/Document/DocumentViewer/DocumentViewerArchive'
import DocumentViewerArchiveFolder from '@/components/Document/DocumentViewer/DocumentViewerArchiveFolder'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'

function createArchive(id = 'zip-id', index = 'idx') {
  return new Document({ _id: id, _routing: id, _index: index, _source: { contentType: 'application/zip' } })
}

function createHit(id, resourceName) {
  return {
    _id: id,
    _index: 'idx',
    _routing: 'zip-id',
    _source: { type: 'Document', title: resourceName, metadata: { tika_metadata_resourcename: resourceName } }
  }
}

function createResponse(hits, total = hits.length) {
  return { hits: { total: { value: total }, hits } }
}

describe('DocumentViewerArchive.vue', () => {
  let search

  async function mountViewer(document = createArchive(), provide = {}) {
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = mount(DocumentViewerArchive, { global: { plugins, provide }, props: { document } })
    await flushPromises()
    return wrapper
  }

  beforeEach(() => {
    search = vi.spyOn(api.elasticsearch, 'search')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('queries direct children of the archive', async () => {
    search.mockResolvedValue(createResponse([]))
    await mountViewer()
    const params = search.mock.calls[0][0]
    expect(params.index).toBe('idx')
    expect(params.routing).toBe('zip-id')
    expect(params.body.size).toBe(10000)
    expect(JSON.stringify(params.body)).toContain('"parentDocument":"zip-id"')
  })

  it('renders folders and documents', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'reports/q1.pdf'), createHit('b', 'notes.txt')]))
    const wrapper = await mountViewer()
    const folders = wrapper.findAllComponents(DocumentViewerArchiveFolder).filter(folder => !folder.props('root'))
    expect(folders).toHaveLength(1)
    expect(folders[0].props('folder').name).toBe('reports')
    expect(wrapper.findAllComponents(PathTreeViewDocument)).toHaveLength(2)
  })

  it('mounts the documents of a collapsed folder only once it is open', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'a/b/deep.txt')]))
    const wrapper = await mountViewer()
    const deepDocuments = () => wrapper.findAllComponents(PathTreeViewDocument).filter(entry => entry.props('entry').id === 'a')
    expect(deepDocuments()).toHaveLength(0)
    const folderB = wrapper.findAllComponents(DocumentViewerArchiveFolder).find(folder => folder.props('folder').name === 'b')
    folderB.findComponent(PathTreeViewEntry).vm.$emit('update:collapse', false)
    await flushPromises()
    expect(deepDocuments()).toHaveLength(1)
  })

  it('opens files in a modal outside of a modal', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'a.txt')]))
    const wrapper = await mountViewer()
    expect(wrapper.findComponent(PathTreeViewDocument).props('noModal')).toBe(false)
  })

  it('opens files as documents inside a modal', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'a.txt')]))
    const wrapper = await mountViewer(createArchive(), { modal: true })
    expect(wrapper.findComponent(PathTreeViewDocument).props('noModal')).toBe(true)
  })

  it('shows the empty message', async () => {
    search.mockResolvedValue(createResponse([]))
    const wrapper = await mountViewer()
    expect(wrapper.text()).toContain('This archive has no extracted files.')
    expect(wrapper.findComponent(DocumentViewerArchiveFolder).exists()).toBe(false)
  })

  it('shows an error when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    search.mockRejectedValue(new Error('boom'))
    const wrapper = await mountViewer()
    expect(wrapper.text()).toContain('could not be loaded')
    expect(wrapper.text()).not.toContain('no extracted files')
  })

  it('shows the limit note above 10,000 files', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'a.txt')], 12000))
    const wrapper = await mountViewer()
    expect(wrapper.text()).toContain('first 10000 of 12000')
  })

  it('reloads when the document changes', async () => {
    search.mockResolvedValueOnce(createResponse([createHit('a', 'a.txt')]))
    search.mockResolvedValueOnce(createResponse([createHit('b', 'b.txt')]))
    const wrapper = await mountViewer()
    await wrapper.setProps({ document: createArchive('zip-2') })
    await flushPromises()
    expect(search).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(search.mock.calls[1][0].body)).toContain('"parentDocument":"zip-2"')
    expect(wrapper.text()).toContain('b.txt')
    expect(wrapper.text()).not.toContain('a.txt')
  })

  it('sorts children by title and requests only the fields the tree needs', async () => {
    search.mockResolvedValue(createResponse([]))
    await mountViewer()
    const params = search.mock.calls[0][0]
    expect(params.body.sort).toEqual([{ title: { order: 'asc' } }])
    expect(params._source).toEqual([
      'title',
      'path',
      'contentType',
      'contentLength',
      'extractionLevel',
      'metadata.tika_metadata_resourcename',
      'metadata.tika_metadata_pst_folderpath'
    ])
    expect(params._source_excludes).toBeUndefined()
  })

  it('reloads when the same archive is opened from another project', async () => {
    search.mockResolvedValueOnce(createResponse([createHit('a', 'a.txt')]))
    search.mockResolvedValueOnce(createResponse([createHit('b', 'b.txt')]))
    const wrapper = await mountViewer()
    await wrapper.setProps({ document: createArchive('zip-id', 'idx-2') })
    await flushPromises()
    expect(search).toHaveBeenCalledTimes(2)
    expect(search.mock.calls[1][0].index).toBe('idx-2')
    expect(wrapper.text()).toContain('b.txt')
  })

  it('labels files with their name inside the folder', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'reports/q1.pdf')]))
    const wrapper = await mountViewer()
    expect(wrapper.text()).toContain('q1.pdf')
    expect(wrapper.text()).not.toContain('reports/q1.pdf')
  })

  it('shows 50 files per folder and more on demand', async () => {
    const hits = Array.from({ length: 60 }, (_, index) => createHit(`f${index}`, `project/f${String(index).padStart(2, '0')}.txt`))
    search.mockResolvedValue(createResponse(hits))
    const wrapper = await mountViewer()
    expect(wrapper.findAllComponents(PathTreeViewDocument)).toHaveLength(50)
    await wrapper.findComponent(PathTreeViewEntryMore).trigger('click')
    expect(wrapper.findAllComponents(PathTreeViewDocument)).toHaveLength(60)
    expect(wrapper.findComponent(PathTreeViewEntryMore).exists()).toBe(false)
  })

  it('logs the error when the request fails', async () => {
    const error = new Error('boom')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    search.mockRejectedValue(error)
    await mountViewer()
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), error)
  })

  it('renders regular entries, which get the hover background, instead of compact ones', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'reports/q1.pdf'), createHit('b', 'notes.txt')]))
    const wrapper = await mountViewer()
    expect(wrapper.find('.path-tree-view-entry--compact').exists()).toBe(false)
  })

  it('renders the top-level entries without indentation, like the paths tree', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'reports/q1.pdf'), createHit('b', 'notes.txt')]))
    const wrapper = await mountViewer()
    const reports = wrapper.findAllComponents(DocumentViewerArchiveFolder).find(folder => folder.props('folder').name === 'reports')
    const notes = wrapper.findAllComponents(PathTreeViewDocument).find(entry => entry.props('entry').id === 'b')
    const q1 = wrapper.findAllComponents(PathTreeViewDocument).find(entry => entry.props('entry').id === 'a')
    expect(reports.findComponent(PathTreeViewEntry).props('level')).toBe(0)
    expect(notes.props('level')).toBe(0)
    expect(q1.props('level')).toBe(1)
  })

  describe('search', () => {
    async function searchFor(wrapper, value) {
      wrapper.findComponent(DocumentToolbox).vm.$emit('update:modelValue', value)
      await new Promise(resolve => setTimeout(resolve, 350))
      await flushPromises()
    }

    function findDocument(wrapper, id) {
      return wrapper.findAllComponents(PathTreeViewDocument).find(entry => entry.props('entry').id === id)
    }

    it('shows the search toolbox', async () => {
      search.mockResolvedValue(createResponse([createHit('a', 'a.txt')]))
      const wrapper = await mountViewer()
      expect(wrapper.findComponent(DocumentToolbox).exists()).toBe(true)
    })

    it('counts the matching folders and files', async () => {
      search.mockResolvedValue(createResponse([createHit('a', 'reports/q1.pdf'), createHit('b', 'notes.txt'), createHit('c', 'q1/x.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'q1')
      expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(2)
    })

    it('opens the folders holding the active match and highlights it', async () => {
      search.mockResolvedValue(createResponse([createHit('a', 'a/b/deep.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'deep')
      expect(findDocument(wrapper, 'a').props('selected')).toBe(true)
    })

    it('shows the page holding the active match', async () => {
      const hits = Array.from({ length: 60 }, (_, index) => createHit(`f${index}`, `project/f${String(index).padStart(2, '0')}.txt`))
      search.mockResolvedValue(createResponse(hits))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'f55')
      expect(findDocument(wrapper, 'f55')?.props('selected')).toBe(true)
    })

    it('moves the highlight to the next match', async () => {
      search.mockResolvedValue(createResponse([createHit('a', 'a/x1.txt'), createHit('b', 'b/x2.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'x')
      wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
      await flushPromises()
      expect(findDocument(wrapper, 'a').props('selected')).toBe(false)
      expect(findDocument(wrapper, 'b').props('selected')).toBe(true)
    })
  })
})
