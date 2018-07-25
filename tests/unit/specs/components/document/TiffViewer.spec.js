import {mount} from '@vue/test-utils'
import TiffViewer from '@/components/document/TiffViewer'
import noop from 'lodash/noop'

describe('TiffViewer.vue', () => {
  beforeEach(async () => {
    TiffViewer.mounted = noop
  })

  it('should display error when tiff is not found', async () => {
    var wrapped = mount(TiffViewer, {propsData: {'url': 'invalid.url'}})
    await wrapped.vm.page(1)
    wrapped.update()

    expect(wrapped.vm.$el.querySelector('.alert').textContent).to.contain('404 Not Found')
  })

  it('should display canvas when tiff is found', async () => {
    var wrapped = mount(TiffViewer, {propsData: {'url': 'base/resources/image.tiff'}})
    await wrapped.vm.page(1)
    wrapped.update()

    expect(wrapped.vm.$el.querySelector('img.tiff-viewer__canvas')).to.not.equal(null)
  })
})
