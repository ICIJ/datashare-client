import { createLocalVue, shallowMount } from '@vue/test-utils'

import TiffViewer from '@/components/document/viewers/TiffViewer'
import { Core } from '@/core'

jest.mock('@/api', () => {
  const { responseWithArrayBuffer } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      getSource: jest.fn().mockImplementation(({ url }) => responseWithArrayBuffer(url))
    }
  })
})

describe('TiffViewer.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(TiffViewer, { i18n, localVue, propsData: { document: { url: 'image.tiff' } } })
  })

  afterAll(() => jest.unmock('@/api'))

  it('should display an error message if the document does not exist', async () => {
    wrapper.setProps({ document: { url: 'nodoc.tiff' } })

    await wrapper.vm.loadPage(1)
    expect(wrapper.find('.tiff-viewer .alert').text()).toContain('The browser preview of this TIFF file may not show')
  })

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.tiff-viewer .alert').text()).toBe('Generating preview...')
  })

  it('should load a tiff content file', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview').exists()).toBeTruthy()
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .tiff-viewer__preview__pages .form-control').element.value).toBe('1')
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .img-thumbnail .tiff-viewer__canvas').exists()).toBeTruthy()
  })

  it('should display a thumbnail by page', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails').exists()).toBeTruthy()
    expect(wrapper.findAll('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails img')).toHaveLength(3)
  })
})
