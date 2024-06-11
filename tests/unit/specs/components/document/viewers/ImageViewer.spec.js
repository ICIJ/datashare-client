import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Document from '@/api/resources/Document'
import ImageViewer from '@/components/document/viewers/ImageViewer'

describe('ImageViewer.vue', () => {
  let wrapper

  beforeEach(() => {
    const document = new Document({ _id: 'a-short-id', _rounting: 'a-short-id', _index: 'an-index-name' })
    const { plugins } = CoreSetup.init().useAll()
    wrapper = mount(ImageViewer, { global: { plugins }, props: { document } })
  })

  it('should create an image tag', async () => {
    expect(wrapper.find('img').exists()).toBeTruthy()
  })

  it('should generate an image href containing `inline`', async () => {
    expect(wrapper.find('img').attributes().src).toContain('&inline')
  })
})
