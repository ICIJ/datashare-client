import { flushPromises, mount } from '@vue/test-utils'


import { responseWithArrayBuffer as mockArrayBuffer } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerTiff from '@/components/Document/DocumentViewer/DocumentViewerTiff'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getSource: vi.fn(({ url }) => mockArrayBuffer(url)),
      retrieveNotes: vi.fn().mockResolvedValue([])
    }
  }
})

describe('DocumentViewerTiff.vue', () => {
  let core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  // This entire test unit is deactivated unly we can support
  // canvas on JSDom + Node 18. Currently the `canvas` pakckage is
  // not compatible with Node 18.
  describe.skip('with an existing file', () => {
    let wrapper = null

    beforeEach(async () => {
      wrapper = mount(DocumentViewerTiff, {

        global: { plugins: core.plugins },
        props: {
          document: {
            url: 'image.tiff',
            project: 'test-project',
            path: '/image.tiff'
          }
        }
      })

      await flushPromises()
    })

    it('should load a tiff content file', () => {
      expect(wrapper.find('.tiff-viewer__preview__canvas').exists()).toBeTruthy()
    })

    it('should display a thumbnail for each page', () => {
      expect(wrapper.find('.tiff-viewer__thumbnails').exists()).toBeTruthy()
      expect(wrapper.findAll('.tiff-viewer__thumbnails__item')).toHaveLength(3)
    })
  })

  describe('with a missing file', () => {
    it('should display an error message if the document does not exist', async () => {      
      api.getSource.mockClear()
      api.getSource.mockRejectedValue(new Error('File not found'))

      const wrapper = mount(DocumentViewerTiff, {
        global: { plugins: core.plugins },
        props: {
          document: {
            url: 'missing.tiff',
            project: 'test-project',
            path: '/missing.tiff'
          }
        }
      })
      await flushPromises()

      expect(wrapper.find('.tiff-viewer__error').exists()).toBeTruthy()
      expect(wrapper.find('.tiff-viewer__error').text()).toContain('File not found')
    })
  })
})
