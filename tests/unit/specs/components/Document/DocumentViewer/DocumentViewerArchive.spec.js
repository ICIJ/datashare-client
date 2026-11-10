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

function createArchive(id = 'zip-id', index = 'idx', contentType = 'application/zip') {
  return new Document({ _id: id, _routing: id, _index: index, _source: { contentType } })
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

function spyOnRender(wrapper) {
  const instance = wrapper.vm.$
  const render = vi.fn(instance.render)
  instance.render = render
  return render
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
    globalThis.CSS = { escape: value => value.replace(/["\\]/g, '\\$&') }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.CSS
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

  it('goes through the client search, which reports errors', async () => {
    const clientSearch = vi.spyOn(api.elasticsearch, '_search')
    search.mockResolvedValue(createResponse([]))
    await mountViewer()
    expect(clientSearch).toHaveBeenCalledOnce()
  })

  it('does not split mailbox email subjects into folders', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'RE: 2024/25 budget')]))
    const wrapper = await mountViewer(createArchive('mbox-id', 'idx', 'application/mbox'))
    const folders = wrapper.findAllComponents(DocumentViewerArchiveFolder).filter(folder => !folder.props('root'))
    expect(folders).toHaveLength(0)
    expect(wrapper.text()).toContain('RE: 2024/25 budget')
  })

  it('does not split PST email subjects into folders when they have no folder path', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'Q3/Q4 budget')]))
    const wrapper = await mountViewer(createArchive('pst-id', 'idx', 'application/vnd.ms-outlook-pst'))
    const folders = wrapper.findAllComponents(DocumentViewerArchiveFolder).filter(folder => !folder.props('root'))
    expect(folders).toHaveLength(0)
    expect(wrapper.text()).toContain('Q3/Q4 budget')
  })

  it('does not re-render other folders when more files are shown in one', async () => {
    const hits = Array.from({ length: 60 }, (_, index) => createHit(`f${index}`, `a/f${index}.txt`))
    search.mockResolvedValue(createResponse([...hits, createHit('b', 'b/y.txt')]))
    const wrapper = await mountViewer()
    const folderB = wrapper.findAllComponents(DocumentViewerArchiveFolder).find(folder => folder.props('folder').name === 'b')
    const render = spyOnRender(folderB)
    await wrapper.findComponent(PathTreeViewEntryMore).trigger('click')
    expect(render).not.toHaveBeenCalled()
  })

  it('does not re-render other folders when one is toggled', async () => {
    search.mockResolvedValue(createResponse([createHit('a', 'a/x.txt'), createHit('b', 'b/y.txt')]))
    const wrapper = await mountViewer()
    const findFolder = name => wrapper.findAllComponents(DocumentViewerArchiveFolder).find(folder => folder.props('folder').name === name)
    const render = spyOnRender(findFolder('b'))
    findFolder('a').findComponent(PathTreeViewEntry).vm.$emit('update:collapse', true)
    await flushPromises()
    expect(render).not.toHaveBeenCalled()
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

    it('does not re-render folders without the previous or next match', async () => {
      search.mockResolvedValue(createResponse([createHit('a', 'a/x1.txt'), createHit('b', 'b/x2.txt'), createHit('c', 'c/z.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'x')
      const folderC = wrapper.findAllComponents(DocumentViewerArchiveFolder).find(folder => folder.props('folder').name === 'c')
      const render = spyOnRender(folderC)
      wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
      await flushPromises()
      expect(render).not.toHaveBeenCalled()
    })

    it('scrolls to the match again once the opened folders finished expanding', async () => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      search.mockResolvedValue(createResponse([createHit('a', 'a/b/deep.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'deep')
      scrollIntoView.mockClear()
      const transitionEnd = new Event('transitionend', { bubbles: true })
      transitionEnd.propertyName = 'height'
      wrapper.element.dispatchEvent(transitionEnd)
      expect(scrollIntoView).toHaveBeenCalledOnce()
      delete Element.prototype.scrollIntoView
    })

    it('scrolls to the match again each time a nested folder finished expanding', async () => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      search.mockResolvedValue(createResponse([createHit('a', 'a/b/deep.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'deep')
      scrollIntoView.mockClear()
      const innerTransitionEnd = new Event('transitionend', { bubbles: true })
      innerTransitionEnd.propertyName = 'height'
      const outerTransitionEnd = new Event('transitionend', { bubbles: true })
      outerTransitionEnd.propertyName = 'height'
      wrapper.element.dispatchEvent(innerTransitionEnd)
      wrapper.element.dispatchEvent(outerTransitionEnd)
      expect(scrollIntoView).toHaveBeenCalledTimes(2)
      delete Element.prototype.scrollIntoView
    })

    it('does not scroll back to a previous match once folders finished expanding', async () => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      search.mockResolvedValue(createResponse([createHit('a', 'a/b/x1.txt'), createHit('b', 'x2.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'x')
      wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
      await flushPromises()
      scrollIntoView.mockClear()
      const transitionEnd = new Event('transitionend', { bubbles: true })
      transitionEnd.propertyName = 'height'
      wrapper.element.dispatchEvent(transitionEnd)
      expect(scrollIntoView).not.toHaveBeenCalled()
      delete Element.prototype.scrollIntoView
    })

    it('scrolls to the header of a matching folder, not to its content', async () => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      search.mockResolvedValue(createResponse([createHit('a', 'reports/q1.pdf')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'reports')
      expect(scrollIntoView.mock.contexts.at(-1).classList).toContain('path-tree-view-entry__header')
      delete Element.prototype.scrollIntoView
    })

    it('does not scroll back to the match once a folder opened by hand finished expanding', async () => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      search.mockResolvedValue(createResponse([createHit('a', 'a/b/deep.txt'), createHit('c', 'c/y.txt')]))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'deep')
      const folderC = wrapper.findAllComponents(DocumentViewerArchiveFolder).find(folder => folder.props('folder').name === 'c')
      folderC.findComponent(PathTreeViewEntry).vm.$emit('update:collapse', true)
      await flushPromises()
      scrollIntoView.mockClear()
      const transitionEnd = new Event('transitionend', { bubbles: true })
      transitionEnd.propertyName = 'height'
      wrapper.element.dispatchEvent(transitionEnd)
      expect(scrollIntoView).not.toHaveBeenCalled()
      delete Element.prototype.scrollIntoView
    })

    it('forgets the matches of the previous archive when the next one fails to load', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      search.mockResolvedValueOnce(createResponse([createHit('a', 'invoice.pdf')]))
      search.mockRejectedValueOnce(new Error('boom'))
      const wrapper = await mountViewer()
      await searchFor(wrapper, 'invoice')
      await wrapper.setProps({ document: createArchive('zip-2') })
      await flushPromises()
      expect(wrapper.findComponent(DocumentToolbox).props('occurrences')).toBe(0)
    })

    describe('with the CSS highlight API', () => {
      beforeEach(() => {
        globalThis.CSS = { highlights: new Map(), escape: value => value }
        globalThis.Highlight = class extends Set {}
      })

      afterEach(() => {
        delete globalThis.CSS
        delete globalThis.Highlight
      })

      function highlightedTexts() {
        return [...globalThis.CSS.highlights.values()].flatMap(highlight => [...highlight].map(range => range.toString()))
      }

      it('keeps the highlights of another viewer when one unmounts', async () => {
        search.mockResolvedValueOnce(createResponse([createHit('a', 'apple.txt')]))
        search.mockResolvedValueOnce(createResponse([createHit('b', 'pear.txt')]))
        const first = await mountViewer()
        const second = await mountViewer(createArchive('zip-2'))
        await searchFor(first, 'apple')
        await searchFor(second, 'pear')
        expect(highlightedTexts().sort()).toEqual(['apple', 'pear'])
        second.unmount()
        expect(highlightedTexts()).toEqual(['apple'])
      })

      it('moves the active highlight without painting the terms again', async () => {
        search.mockResolvedValue(createResponse([createHit('a', 'x1.txt'), createHit('b', 'x2.txt')]))
        const wrapper = await mountViewer()
        await searchFor(wrapper, 'x')
        const ranges = [...globalThis.CSS.highlights.values()].flatMap(highlight => [...highlight])
        wrapper.findComponent(DocumentToolbox).vm.$emit('update:activeIndex', 2)
        await flushPromises()
        const active = [...globalThis.CSS.highlights.get('archive-search-term-active')]
        const term = [...globalThis.CSS.highlights.get('archive-search-term')]
        const repainted = [...active, ...term]
        expect(repainted).toHaveLength(ranges.length)
        expect(ranges.every(range => repainted.includes(range))).toBe(true)
        expect(new Set(active.map(range => range.startContainer.data))).toEqual(new Set(['x2.txt']))
      })
    })
  })
})
