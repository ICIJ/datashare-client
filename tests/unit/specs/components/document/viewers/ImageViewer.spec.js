import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import ImageViewer from '@/components/document/viewers/ImageViewer.vue'
import Document from '@/api/Document'

const localVue = createLocalVue()
localVue.use(Murmur)

describe('ImageViewer.vue', () => {
  it('should create an image tag', async () => {
    const document = new Document({
      _id: 'a-short-id',
      _rounting: 'a-short-id',
      _index: 'an-index-name'
    })

    const wrapper = mount(ImageViewer, { localVue, propsData: { document } })
    expect(wrapper.find('img').exists()).toBeTruthy()
  })

  it('should generate an image href containing `inline`', async () => {
    const document = new Document({
      _id: 'a-short-id',
      _rounting: 'a-short-id',
      _index: 'an-index-name'
    })

    const wrapper = mount(ImageViewer, { localVue, propsData: { document } })
    expect(wrapper.vm.href).toContain('&inline')
  })
})
