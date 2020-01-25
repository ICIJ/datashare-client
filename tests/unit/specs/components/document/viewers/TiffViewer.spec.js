import { createLocalVue, shallowMount } from '@vue/test-utils'

import { responseWithArrayBuffer } from 'tests/unit/tests_utils'
import { App } from '@/main'
import TiffViewer from '@/components/document/viewers/TiffViewer'

const { localVue } = App.init(createLocalVue()).useAll()

describe('TiffViewer.vue', () => {
  let wrapper = null
  let getSource = jest.fn().mockImplementation(({ url }) => responseWithArrayBuffer(url))
  let methods = { getSource }
  let mocks = { $t: msg => msg }

  it('should display an error message if the document does not exist', async () => {
    wrapper = shallowMount(TiffViewer, { localVue, mocks, methods, propsData: { document: { url: 'nodoc.tiff' } } })

    await wrapper.vm.loadPage(1)
    expect(wrapper.find('.tiff-viewer .alert').text()).toBe('document.error_not_found')
  })

  it('should display a message while generating the preview', () => {
    wrapper = shallowMount(TiffViewer, { localVue, mocks, methods, propsData: { document: { url: 'image.tiff' } } })
    expect(wrapper.find('.tiff-viewer .alert').text()).toBe('document.generating_preview')
  })

  it('should load a tiff content file', async () => {
    wrapper = shallowMount(TiffViewer, { localVue, mocks, methods, propsData: { document: { url: 'image.tiff' } } })
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview').exists()).toBeTruthy()
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .tiff-viewer__preview__pages .form-control').element.value).toBe('1')
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .img-thumbnail .tiff-viewer__canvas').exists()).toBeTruthy()
  })

  it('should display a thumbnail by page', async () => {
    wrapper = shallowMount(TiffViewer, { localVue, mocks, methods, propsData: { document: { url: 'image.tiff' } } })
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails').exists()).toBeTruthy()
    expect(wrapper.findAll('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails img')).toHaveLength(3)
  })
})
