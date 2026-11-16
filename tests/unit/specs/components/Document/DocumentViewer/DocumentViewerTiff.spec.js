import { flushPromises, mount } from '@vue/test-utils'
import * as tiff from 'tiff'

import { responseWithArrayBuffer as mockArrayBuffer } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerTiff from '@/components/Document/DocumentViewer/DocumentViewerTiff'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      getSource: vi.fn(({ url }) => mockArrayBuffer(url)),
      getPathBanners: vi.fn().mockResolvedValue([])
    }
  }
})

vi.mock('tiff', () => ({ decode: vi.fn() }))

function greyPage({ bitsPerSample = 8 } = {}) {
  const ArrayType = bitsPerSample === 16 ? Uint16Array : Uint8Array
  const data = new ArrayType([0, 64, 128, 255])
  return { width: 2, height: 2, type: 1, bitsPerSample, samplesPerPixel: 1, alpha: false, data }
}

describe('DocumentViewerTiff.vue', () => {
  let core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  describe('with an existing file', () => {
    async function mountViewer() {
      const wrapper = mount(DocumentViewerTiff, {
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
      return wrapper
    }

    beforeEach(() => {
      tiff.decode.mockReturnValue([greyPage(), greyPage(), greyPage()])
    })

    it('displays an 8-bit greyscale page', async () => {
      const wrapper = await mountViewer()
      expect(wrapper.find('.tiff-viewer__error').exists()).toBe(false)
      expect(wrapper.find('.tiff-viewer__preview__canvas').attributes('src')).toMatch(/^data:image\/png;base64,.+/)
    })

    it('displays a 16-bit greyscale page', async () => {
      tiff.decode.mockReturnValue([greyPage({ bitsPerSample: 16 })])
      const wrapper = await mountViewer()
      expect(wrapper.find('.tiff-viewer__error').exists()).toBe(false)
      expect(wrapper.find('.tiff-viewer__preview__canvas').attributes('src')).toMatch(/^data:image\/png;base64,.+/)
    })

    it('displays a thumbnail for each page', async () => {
      const wrapper = await mountViewer()
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
