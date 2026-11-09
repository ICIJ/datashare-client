import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { apiInstance as api } from '@/api/apiInstance'
import Document from '@/api/resources/Document'
import DocumentViewerArchive from '@/components/Document/DocumentViewer/DocumentViewerArchive'
import DocumentViewerArchiveFolder from '@/components/Document/DocumentViewer/DocumentViewerArchiveFolder'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'

function createArchive(id = 'zip-id') {
  return new Document({ _id: id, _routing: id, _index: 'idx', _source: { contentType: 'application/zip' } })
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

  async function mountViewer(document = createArchive()) {
    const { plugins } = CoreSetup.init().useAll()
    const wrapper = mount(DocumentViewerArchive, { global: { plugins }, props: { document } })
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
    const folders = wrapper.findAllComponents(DocumentViewerArchiveFolder)
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

  it('shows the empty message', async () => {
    search.mockResolvedValue(createResponse([]))
    const wrapper = await mountViewer()
    expect(wrapper.text()).toContain('This archive has no extracted files.')
    expect(wrapper.findComponent(DocumentViewerArchiveFolder).exists()).toBe(false)
  })

  it('shows an error when the request fails', async () => {
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
})
