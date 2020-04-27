import { createLocalVue, shallowMount } from '@vue/test-utils'

import PdfViewer from '@/components/document/viewers/PdfViewer'
import { Core } from '@/core'
import { responseWithArrayBuffer } from 'tests/unit/tests_utils'

const { i18n, localVue } = Core.init(createLocalVue()).useAll()

describe('PdfViewer.vue', () => {
  let wrapper = null
  const getSource = jest.fn().mockImplementation(({ url }) => responseWithArrayBuffer(url))
  const methods = { getSource }

  beforeEach(() => {
    wrapper = shallowMount(PdfViewer, { i18n, localVue, methods, propsData: { document: { url: 'document.pdf' } } })
  })

  it('should display an error message if the document does not exist', async () => {
    wrapper = shallowMount(PdfViewer, { i18n, localVue, methods, propsData: { document: { url: 'nodoc.pdf' } } })

    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .alert').text()).toBe('document.error_not_found')
  })

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.pdf-viewer .alert').text()).toBe('Generating preview...')
  })

  it('should load a pdf content file', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .pdf-viewer__preview').exists()).toBeTruthy()
    expect(wrapper.find('.pdf-viewer .pdf-viewer__thumbnails .form-control').element.value).toBe('1')
    expect(wrapper.find('.pdf-viewer .pdf-viewer__preview__canvas').exists()).toBeTruthy()
  })

  it('should display a thumbnail by page', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .pdf-viewer__thumbnails').exists()).toBeTruthy()
    expect(wrapper.findAll('.pdf-viewer .pdf-viewer__thumbnails img')).toHaveLength(2)
  })
})
