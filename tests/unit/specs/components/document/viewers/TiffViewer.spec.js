import { createLocalVue, shallowMount } from '@vue/test-utils'
import { flushPromises, responseWithArrayBuffer as mockArrayBuffer } from 'tests/unit/tests_utils'

import TiffViewer from '@/components/document/viewers/TiffViewer'
import { Core } from '@/core'
import { Api } from '@/api'
import { getMode, MODE_NAME } from '@/mode'

describe('TiffViewer.vue', () => {
  let i18n, localVue, api
  beforeAll(async () => {
    api = new Api(null, null)
    api.getSource = jest.fn()
    const core = Core.init(createLocalVue(), api, getMode(MODE_NAME.SERVER)).useAll()
    i18n = core.i18n
    localVue = core.localVue
  })
  describe('with an existing file', () => {
    let wrapper = null

    beforeEach(async () => {
      api.getSource.mockClear()
      api.getSource.mockImplementation(({ url }) => mockArrayBuffer(url))

      wrapper = shallowMount(TiffViewer, { i18n, localVue, propsData: { document: { url: 'image.tiff' } } })
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
      const wrapper = shallowMount(TiffViewer, { i18n, localVue, propsData: { document: { url: 'missing.tiff' } } })
      await flushPromises()

      expect(wrapper.find('.tiff-viewer__error').text()).toContain('File not found')
    })
  })
})
