import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import TiffViewer from '@/components/document/TiffViewer'
import { mount, createLocalVue } from '@vue/test-utils'
import {createServer} from 'http-server'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

describe.skip('TiffViewer.vue', () => {
  let httpServer = null
  beforeAll(() => {
    httpServer = createServer({root: 'tests/unit'})
    httpServer.listen(9876)
  })
  afterAll(() => {
    httpServer.close()
  })

  it('should display error when tiff is not found', async () => {
    var wrapped = mount(TiffViewer, {localVue, propsData: {'url': 'http://localhost:9876/invalid.url'}})
    await wrapped.vm.page(1)
    await localVue.nextTick()

    expect(wrapped.vm.$el.querySelector('.alert').textContent).toContain('404 Not Found')
  })

  it('should display canvas when tiff is found', async () => {
    var wrapped = mount(TiffViewer, {localVue, propsData: {'url': 'http://localhost:9876/resources/image.tiff'}})
    await wrapped.vm.page(1)
    await localVue.nextTick()

    expect(wrapped.vm.$el.querySelector('img.tiff-viewer__canvas')).not.toEqual(null)
  })
})
