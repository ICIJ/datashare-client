import { shallowMount } from '@vue/test-utils'

import { flushPromises, responseWithArrayBuffer as mockArrayBuffer } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import TiffViewer from '@/components/document/viewers/TiffViewer'
import { getMode, MODE_NAME } from '@/mode'

describe('TiffViewer.vue', () => {
  let core, api

  beforeAll(async () => {
    api = { getSource: vi.fn() }
    core = CoreSetup.init(api, getMode(MODE_NAME.SERVER)).useAll()
  })

  // This entire test unit is deactivated unly we can support
  // canvas on JSDom + Node 18. Currently the `canvas` pakckage is
  // not compatible with Node 18.
  describe.skip('with an existing file', () => {
    let wrapper = null

    beforeEach(async () => {
      api.getSource.mockClear()
      api.getSource.mockImplementation(({ url }) => mockArrayBuffer(url))

      wrapper = shallowMount(TiffViewer, {
        global: { plugins: core.plugins },
        props: { document: { url: 'image.tiff' } }
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
      // given
      api.getSource.mockClear()
      api.getSource = () => {
        throw new Error('File not found')
      }
      // when
      const wrapper = shallowMount(TiffViewer, {
        global: { plugins: core.plugins },
        props: { document: { url: 'missing.tiff' } }
      })
      await flushPromises()

      expect(wrapper.find('.tiff-viewer__error').text()).toContain('File not found')
    })
  })
})
