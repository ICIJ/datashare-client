import {mount} from 'vue-test-utils'
import PdfViewer from '@/components/document/PdfViewer'
import noop from 'lodash/noop'
import PDFJS from 'pdfjs-dist'

describe.only('PdfViewer.vue', () => {
  beforeEach(async () => {
    PdfViewer.mounted = noop
  })

  it('should display error when PDF is not found', async () => {
    var wrapped = mount(PdfViewer, {propsData: {'url': 'invalid.url'}})
    await wrapped.vm.page(1)
    wrapped.update()

    expect(wrapped.vm.$el.querySelector('.alert').textContent).to.contain('Missing PDF')
  })

  it('should display canvas when PDF is found', async () => {
    var wrapped = mount(PdfViewer, {propsData: {'url': 'base/resources/document.pdf'}})
    await wrapped.vm.page(1)
    wrapped.update()

    expect(wrapped.vm.$el.querySelector('img.pdf-viewer__canvas')).to.not.equal(null)
  }, 10000)

  it('should cache pdf data', async () => {
    var getDocument = sinon.spy(PDFJS, 'getDocument')
    var wrapped = mount(PdfViewer, {propsData: {'url': 'base/resources/document.pdf'}})
    await wrapped.vm.page(1)
    await wrapped.vm.page(2)
    wrapped.update()

    getDocument.restore()
    sinon.assert.calledOnce(getDocument)
  }, 10000)
})
