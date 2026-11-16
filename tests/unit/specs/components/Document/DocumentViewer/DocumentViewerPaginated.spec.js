import { flushPromises, mount } from '@vue/test-utils'
import axios from 'axios'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentViewerPaginated from '@/components/Document/DocumentViewer/DocumentViewerPaginated'

vi.mock('axios')

describe('DocumentViewerPaginated.vue', () => {
  let core

  const document = { index: 'local', id: 'doc', routing: 'root', contentType: 'application/msword' }

  async function mountViewer(meta) {
    axios.mockResolvedValue({ data: meta })
    const wrapper = mount(DocumentViewerPaginated, {
      props: { document },
      global: { plugins: core.plugins, stubs: { DocumentThumbnail: true } }
    })
    await flushPromises()
    return wrapper
  }

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    core.config.set('previewHost', 'http://preview')
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('renders the toolbox without search and with the page count', async () => {
    const wrapper = await mountViewer({ pages: 3, previewable: true })
    const toolbox = wrapper.findComponent(DocumentToolbox)
    expect(toolbox.props('noSearch')).toBe(true)
    expect(toolbox.props('totalPages')).toBe(3)
  })

  it('renders every page', async () => {
    const wrapper = await mountViewer({ pages: 3, previewable: true })
    expect(wrapper.findAll('.paginated-viewer__preview__page')).toHaveLength(3)
  })

  it('scrolls to the page picked in the toolbox', async () => {
    const wrapper = await mountViewer({ pages: 3, previewable: true })
    const pages = wrapper.findAll('.paginated-viewer__preview__page')
    const scrollIntoView = vi.spyOn(pages[1].element, 'scrollIntoView')
    await wrapper.findComponent(DocumentToolbox).vm.$emit('update:page', 2)
    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('renders no toolbox for a single page', async () => {
    const wrapper = await mountViewer({ pages: 1, previewable: true })
    expect(wrapper.findComponent(DocumentToolbox).exists()).toBe(false)
  })

  it('shows not available and no toolbox when the document is not previewable', async () => {
    const wrapper = await mountViewer({ pages: 3, previewable: false })
    expect(wrapper.findComponent(DocumentToolbox).exists()).toBe(false)
    expect(wrapper.text()).toContain('Preview is not available for this document type.')
  })
})
