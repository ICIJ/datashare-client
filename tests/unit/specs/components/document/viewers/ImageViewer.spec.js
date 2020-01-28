import { createLocalVue, mount } from '@vue/test-utils'

import { App } from '@/main'
import Document from '@/api/resources/Document'
import ImageViewer from '@/components/document/viewers/ImageViewer.vue'

const { localVue } = App.init(createLocalVue()).useAll()

describe('ImageViewer.vue', () => {
  let wrapper
  const document = new Document({ _id: 'a-short-id', _rounting: 'a-short-id', _index: 'an-index-name' })

  beforeEach(() => {
    wrapper = mount(ImageViewer, { localVue, propsData: { document } })
  })

  it('should create an image tag', async () => {
    expect(wrapper.find('img').exists()).toBeTruthy()
  })

  it('should generate an image href containing `inline`', async () => {
    expect(wrapper.vm.href).toContain('&inline')
  })
})
