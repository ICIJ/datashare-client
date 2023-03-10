import { createLocalVue, mount } from '@vue/test-utils'

import { Core } from '@/core'
import Document from '@/api/resources/Document'
import ImageViewer from '@/components/document/viewers/ImageViewer'

const { localVue } = Core.init(createLocalVue()).useAll()

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
    expect(wrapper.find('img').attributes().src).toContain('&inline')
  })
})
