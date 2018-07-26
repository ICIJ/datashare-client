import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import PdfViewer from '@/components/document/PdfViewer'
import noop from 'lodash/noop'
import PDFJS from 'pdfjs-dist'

describe.skip('PdfViewer.vue', () => {
  beforeEach(async () => {
    PdfViewer.mounted = noop
  })

  it('should display canvas when PDF is found', async () => {
    var wrapped = mount(PdfViewer, {propsData: {'url': '/document.pdf'}})
    await wrapped.vm.loadPage(1)
    expect(wrapped.vm.$el.querySelector('img.pdf-viewer__canvas')).to.not.equal(null)
  }, 10000)

  it('should cache pdf data', async () => {
    var getDocument = sinon.spy(PDFJS, 'getDocument')
    var wrapped = mount(PdfViewer, {propsData: {'url': '/document.pdf'}})
    await wrapped.vm.loadPage(1)
    await wrapped.vm.loadPage(2)
    getDocument.restore()
    wrapped.update()
    sinon.assert.calledOnce(getDocument)
  }, 10000)

  it('should display pdf page', async () => {
    var wrapped = mount(PdfViewer, {propsData: {'url': '/document.pdf'}})
    expect(wrapped.vm.page(1)).to.equal(undefined)
    await wrapped.vm.loadPage(1)
    expect(wrapped.vm.page(1)).to.not.equal(undefined)
  })
})
