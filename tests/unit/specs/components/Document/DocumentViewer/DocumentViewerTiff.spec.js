import { flushPromises, mount } from '@vue/test-utils'
import * as tiff from 'tiff'

import { responseWithArrayBuffer as mockArrayBuffer } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
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
    async function mountViewer(project = 'test-project') {
      const wrapper = mount(DocumentViewerTiff, {
        global: { plugins: core.plugins },
        props: {
          document: {
            url: 'image.tiff',
            project,
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

    it('renders the toolbox without search and with the page count', async () => {
      const wrapper = await mountViewer()
      const toolbox = wrapper.findComponent(DocumentToolbox)
      expect(toolbox.props('noSearch')).toBe(true)
      expect(toolbox.props('totalPages')).toBe(3)
    })

    it('shows the page picked in the toolbox', async () => {
      const wrapper = await mountViewer()
      await wrapper.findComponent(DocumentToolbox).vm.$emit('update:page', 2)
      expect(wrapper.vm.active).toBe(2)
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

    it('renders no toolbox for a single page', async () => {
      tiff.decode.mockReturnValue([greyPage()])
      const wrapper = await mountViewer()
      expect(wrapper.findComponent(DocumentToolbox).exists()).toBe(false)
    })

    it('disables the toolbox while the page is blurred', async () => {
      api.getPathBanners.mockResolvedValueOnce([{ path: '/', blurSensitiveMedia: true, note: 'Sensitive' }])
      const wrapper = await mountViewer('blurred-project')
      expect(wrapper.findComponent(DocumentToolbox).props('disabled')).toBe(true)
    })

    it('shows an error when the banners cannot be fetched', async () => {
      api.getPathBanners.mockRejectedValueOnce(new Error('Banners unavailable'))
      const wrapper = await mountViewer('failing-project')
      expect(wrapper.find('.tiff-viewer__error').text()).toBe('Banners unavailable')
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
