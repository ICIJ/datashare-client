import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import PdfViewer from '@/components/document/PdfViewer'
import { createServer } from 'http-server'
import messages from '@/lang/en'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('PdfViewer.vue', () => {
  let httpServer
  let wrapper

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  beforeEach(() => {
    wrapper = shallowMount(PdfViewer, { localVue, i18n, propsData: { document: { url: 'document.pdf' } } })
  })

  afterAll(() => {
    httpServer.close()
  })

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.pdf-viewer .alert').text()).toEqual('Generating preview...')
  })

  it('should load a pdf content file', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .pdf-viewer__header').exists()).toBeTruthy()
    expect(wrapper.find('.pdf-viewer .pdf-viewer__header .form-control').element.value).toEqual('1')
    expect(wrapper.find('.pdf-viewer .pdf-viewer__canvas').exists()).toBeTruthy()
  })

  it('should display an error message if the document does not exist', async () => {
    const id = 'nodoc.pdf'
    const wrapper = shallowMount(PdfViewer, { localVue, i18n, propsData: { document: { url: id } } })

    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.pdf-viewer .alert').text()).toContain('Missing PDF')
  })
})
