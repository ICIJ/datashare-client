import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import { mount, createLocalVue } from '@vue/test-utils'
import PdfViewer from '@/components/document/PdfViewer'
import noop from 'lodash/noop'
import PDFJS from 'pdfjs-dist'
import {createServer} from 'http-server'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

describe('PdfViewer.vue', () => {
  let httpServer = null
  beforeAll(() => {
    httpServer = createServer({root: 'tests/unit/resources'})
    httpServer.listen(9876)
  })
  afterAll(() => {
    httpServer.close()
  })
  beforeEach(async () => {
    PdfViewer.mounted = noop
  })

  it('should display canvas when PDF is not found', async () => {
    var wrapped = mount(PdfViewer, {localVue, propsData: { url: 'missingDocument.pdf' }})
    await wrapped.vm.loadPage(1)
    expect(wrapped.vm.$el.querySelector('img.pdf-viewer__canvas')).toEqual(null)
    expect(wrapped.vm.$el.querySelector('.alert').textContent).toContain('stream must have data')
  }, 10000)

  it('should cache pdf data', async () => {
    jest.spyOn(PDFJS, 'getDocument')
    var wrapped = mount(PdfViewer, {localVue, propsData: { url: 'document.pdf' }})
    await wrapped.vm.loadPage(1)
    await wrapped.vm.loadPage(2)
    await localVue.nextTick()
    expect(PDFJS.getDocument).toHaveBeenCalled()
  }, 10000)

  it('should display pdf page', async () => {
    var wrapped = mount(PdfViewer, {localVue, propsData: { url: 'document.pdf' }})
    expect(wrapped.vm.page(1)).toBeUndefined(undefined)
    await wrapped.vm.loadPage(1)
    expect(wrapped.vm.page(1)).not.toBeUndefined(undefined)
  })
})
