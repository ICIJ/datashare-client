import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerCode from '@/components/Document/DocumentViewer/DocumentViewerCode'
import DocumentViewerConvertedPdf from '@/components/Document/DocumentViewer/DocumentViewerConvertedPdf'
import DocumentViewerPaginated from '@/components/Document/DocumentViewer/DocumentViewerPaginated'
import DocumentViewerPdf from '@/components/Document/DocumentViewer/DocumentViewerPdf'

// jsdom has no DOMMatrix, which pdfjs builds when its modules are imported.
vi.mock('@tato30/vue-pdf', () => ({ VuePDF: {} }))
vi.mock('@/composables/usePDF', () => ({ usePDF: vi.fn() }))

describe('DocumentViewerConvertedPdf.vue', () => {
  let core

  const word = { index: 'local', id: 'doc', routing: 'root', contentType: 'application/msword' }
  const rtf = { ...word, contentType: 'application/rtf' }
  const textRtf = { ...word, contentType: 'text/rtf', isCode: true }

  function mountViewer(document) {
    return shallowMount(DocumentViewerConvertedPdf, {
      props: { document },
      global: { plugins: core.plugins }
    })
  }

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    core.config.set('previewHost', 'http://preview')
  })

  it('renders the PDF viewer with the preview PDF URL', () => {
    const wrapper = mountViewer(word)
    const src = wrapper.findComponent(DocumentViewerPdf).props('src')
    expect(src).toBe('http://preview/api/v1/pdf/local/doc?routing=root')
  })

  it('falls back to the paginated viewer for a Word document when the PDF fails', async () => {
    const wrapper = mountViewer(word)
    wrapper.findComponent(DocumentViewerPdf).vm.$emit('error', new Error('415'))
    await nextTick()
    expect(wrapper.findComponent(DocumentViewerPaginated).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentViewerPdf).exists()).toBe(false)
  })

  it('shows not available for an RTF document when the PDF fails', async () => {
    const wrapper = mountViewer(rtf)
    wrapper.findComponent(DocumentViewerPdf).vm.$emit('error', new Error('415'))
    await nextTick()
    expect(wrapper.text()).toContain('Preview is not available for this document type.')
  })

  it('falls back to the code viewer for a text/rtf document when the PDF fails', async () => {
    const wrapper = mountViewer(textRtf)
    wrapper.findComponent(DocumentViewerPdf).vm.$emit('error', new Error('415'))
    await nextTick()
    expect(wrapper.findComponent(DocumentViewerCode).exists()).toBe(true)
  })

  it('retries the PDF after switching document', async () => {
    const wrapper = mountViewer(word)
    wrapper.findComponent(DocumentViewerPdf).vm.$emit('error', new Error('415'))
    await nextTick()
    await wrapper.setProps({ document: { ...word, id: 'other' } })
    expect(wrapper.findComponent(DocumentViewerPdf).exists()).toBe(true)
  })

  it('skips the PDF when no preview host is configured', () => {
    core.config.set('previewHost', null)
    const wrapper = mountViewer(word)
    expect(wrapper.findComponent(DocumentViewerPaginated).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentViewerPdf).exists()).toBe(false)
  })
})
