import { createLocalVue, shallowMount } from '@vue/test-utils'
import { flushPromises, responseWithArrayBuffer as mockArrayBuffer } from 'tests/unit/tests_utils'

import TiffViewer from '@/components/document/viewers/TiffViewer'
import { Core } from '@/core'

import Api from '@/api'

describe('TiffViewer.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()

  describe('with an existing file', () => {
    let wrapper = null

    beforeAll(async () => {
      jest.spyOn(Api.prototype, 'getSource')
        .mockImplementation(({ url }) => {
          return mockArrayBuffer(url)
        })
    })

    beforeEach(async () => {
      wrapper = shallowMount(TiffViewer, { i18n, localVue, propsData: { document: { url: 'image.tiff' } } })
      await flushPromises()
    })

    afterAll(() => jest.clearAllMocks())

    it('should load a tiff content file', () => {
      expect(wrapper.find('.tiff-viewer__preview__canvas').exists()).toBeTruthy()
    })

    it('should display a thumbnail for each page', () => {
      expect(wrapper.find('.tiff-viewer__thumbnails').exists()).toBeTruthy()
      expect(wrapper.findAll('.tiff-viewer__thumbnails__item')).toHaveLength(3)
    })
  })

  describe('with a missing file', () => {
    let wrapper = null

    beforeAll(async () => {
      jest.spyOn(Api.prototype, 'getSource')
        .mockImplementation(async ({ url }) => {
          throw new Error('File not found')
        })
    })

    beforeEach(async () => {
      wrapper = shallowMount(TiffViewer, { i18n, localVue, propsData: { document: { url: 'missing.tiff' } } })
      await flushPromises()
    })

    afterAll(() => jest.clearAllMocks())

    it('should display an error message if the document does not exist', () => {
      expect(wrapper.find('.tiff-viewer__error').text()).toContain('File not found')
    })
  })
})
