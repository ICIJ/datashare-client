import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Document from '@/api/resources/Document'
import DocumentViewerImage from '@/components/Document/DocumentViewer/DocumentViewerImage'

vi.mock('@/composables/useImage', () => {
  return {
    useImage() {
      return {
        async rotateBase64Image() {
          return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
        }
      }
    }
  }
})

describe('DocumentViewerImage.vue', () => {
  let wrapper

  beforeEach(async () => {
    const document = new Document({ _id: 'a-short-id', _routing: 'a-short-id', _index: 'an-index-name' })
    const { plugins } = CoreSetup.init().useAll()
    wrapper = mount(DocumentViewerImage, { global: { plugins }, props: { document } })
    await flushPromises()
  })

  it('should create an image tag', async () => {
    expect(wrapper.find('img').exists()).toBeTruthy()
  })

  it('should generate an image href containing with a base64 image', async () => {
    const src = wrapper.find('img').attributes('src')
    expect(src).toContain('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==')
  })
})
