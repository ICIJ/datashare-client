import { createLocalVue, shallowMount } from '@vue/test-utils'

import TiffViewer from '@/components/document/viewers/TiffViewer'
import { Core } from '@/core'
import { responseWithArrayBuffer } from 'tests/unit/tests_utils'

const { i18n, localVue } = Core.init(createLocalVue()).useAll()

describe('TiffViewer.vue', () => {
  let wrapper = null
  const getSource = jest.fn().mockImplementation(({ url }) => responseWithArrayBuffer(url))
  const methods = { getSource }

  it('should display an error message if the document does not exist', async () => {
    wrapper = shallowMount(TiffViewer, { i18n, localVue, methods, propsData: { document: { url: 'nodoc.tiff' } } })

    await wrapper.vm.loadPage(1)
    expect(wrapper.find('.tiff-viewer .alert').text()).toBe('document.error_not_found')
  })

  it('should display a message while generating the preview', () => {
    wrapper = shallowMount(TiffViewer, { i18n, localVue, methods, propsData: { document: { url: 'image.tiff' } } })
    expect(wrapper.find('.tiff-viewer .alert').text()).toBe('Generating preview...')
  })

  it('should load a tiff content file', async () => {
    wrapper = shallowMount(TiffViewer, { i18n, localVue, methods, propsData: { document: { url: 'image.tiff' } } })
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview').exists()).toBeTruthy()
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .tiff-viewer__preview__pages .form-control').element.value).toBe('1')
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .img-thumbnail .tiff-viewer__canvas').exists()).toBeTruthy()
  })

  it('should display a thumbnail by page', async () => {
    wrapper = shallowMount(TiffViewer, { i18n, localVue, methods, propsData: { document: { url: 'image.tiff' } } })
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails').exists()).toBeTruthy()
    expect(wrapper.findAll('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails img')).toHaveLength(3)
  })
})
