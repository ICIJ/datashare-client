import { createServer } from 'http-server'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import PdfViewer from '@/components/document/viewers/PdfViewer'

const { localVue } = App.init(createLocalVue()).useAll()

describe('PdfViewer.vue', () => {
  let httpServer, wrapper

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  beforeEach(() => {
    wrapper = shallowMount(PdfViewer, { localVue, propsData: { document: { url: 'document.pdf' } }, mocks: { $t: msg => msg } })
  })

  afterAll(() => httpServer.close())

  it('should display an error message if the document does not exist', async () => {
    wrapper = shallowMount(PdfViewer, { localVue, propsData: { document: { url: 'nodoc.pdf' } }, mocks: { $t: msg => msg } })

    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .alert').text()).toBe('document.error_not_found')
  })

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.pdf-viewer .alert').text()).toBe('document.generating_preview')
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
