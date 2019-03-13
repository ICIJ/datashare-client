import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createServer } from 'http-server'
import TiffViewer from '@/components/document/TiffViewer'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('TiffViewer.vue', () => {
  let httpServer, wrapper

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  beforeEach(() => {
    wrapper = shallowMount(TiffViewer, { localVue, i18n, propsData: { document: { url: 'image.tiff' } } })
  })

  afterAll(() => httpServer.close())

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.tiff-viewer .alert').text()).toEqual('Generating preview...')
  })

  it('should display an error message if the document does not exist', async () => {
    const wrapper = shallowMount(TiffViewer, { localVue, i18n, propsData: { document: { url: 'nodoc.tiff' } } })

    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .alert').text()).toContain('404 Not Found')
  })

  it('should load a tiff content file', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview').exists()).toBeTruthy()
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .tiff-viewer__preview__pages .form-control').element.value).toEqual('1')
    expect(wrapper.find('.tiff-viewer .tiff-viewer__preview .img-thumbnail .tiff-viewer__canvas').exists()).toBeTruthy()
  })

  it('should display a thumbnail by page', async () => {
    await wrapper.vm.loadPage(1)

    expect(wrapper.find('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails').exists()).toBeTruthy()
    expect(wrapper.findAll('.tiff-viewer .tiff-viewer__header .tiff-viewer__thumbnails img')).toHaveLength(9)
  })
})
