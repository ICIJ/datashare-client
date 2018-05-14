import {mount} from 'vue-test-utils'
import PdfViewer from '@/components/document/PdfViewer'

describe.only('PdfViewer.vue', () => {
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
})
