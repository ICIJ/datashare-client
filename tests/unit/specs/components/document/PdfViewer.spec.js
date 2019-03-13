import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createServer } from 'http-server'
import PdfViewer from '@/components/document/PdfViewer'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('PdfViewer.vue', () => {
  let httpServer, wrapper

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  beforeEach(() => {
    wrapper = shallowMount(PdfViewer, { localVue, i18n, propsData: { document: { url: 'document.pdf' } } })
  })

  afterAll(() => httpServer.close())

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.pdf-viewer .alert').text()).toEqual('Generating preview...')
  })

  it('should display an error message if the document does not exist', async () => {
    const wrapper = shallowMount(PdfViewer, { localVue, i18n, propsData: { document: { url: 'nodoc.pdf' } } })

    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .alert').text()).toContain('Missing PDF')
  })

  it('should load a pdf content file', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .pdf-viewer__preview').exists()).toBeTruthy()
    expect(wrapper.find('.pdf-viewer .pdf-viewer__preview .pdf-viewer__preview__header .form-control').element.value).toEqual('1')
    expect(wrapper.find('.pdf-viewer .pdf-viewer__preview .pdf-viewer__preview__canvas').exists()).toBeTruthy()
  })

  it('should display a thumbnail by page', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .pdf-viewer__header .pdf-viewer__thumbnails').exists()).toBeTruthy()
    expect(wrapper.findAll('.pdf-viewer .pdf-viewer__header .pdf-viewer__thumbnails img')).toHaveLength(2)
  })
})
