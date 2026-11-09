import { mount } from '@vue/test-utils'

import DocumentViewerPdfPage from '@/components/Document/DocumentViewer/DocumentViewerPdf/DocumentViewerPdfPage'

// The real renderer bundles a pdfjs copy that needs a DOMMatrix jsdom lacks. This
// one renders the text layer highlights the page looks up.
vi.mock('@tato30/vue-pdf', async () => {
  const { h } = await import('vue')
  return {
    VuePDF: {
      setup(_, { expose }) {
        expose({ reload: () => {} })
        return () => h('div', [h('span', { class: 'highlight' }, 'one'), h('span', { class: 'highlight' }, 'two')])
      }
    }
  }
})

describe('DocumentViewerPdfPage.vue', () => {
  it('activates its highlight again and scrolls to it when asked', () => {
    const wrapper = mount(DocumentViewerPdfPage, { props: { pdf: {}, highlightIndex: 2 } })
    const [first, second] = wrapper.findAll('.highlight').map(({ element }) => element)
    second.scrollIntoView = vi.fn()
    wrapper.vm.$.exposed.applyHighlight()
    expect(first.classList.contains('highlight--active')).toBe(false)
    expect(second.classList.contains('highlight--active')).toBe(true)
    expect(second.scrollIntoView).toHaveBeenCalledTimes(1)
  })
})
