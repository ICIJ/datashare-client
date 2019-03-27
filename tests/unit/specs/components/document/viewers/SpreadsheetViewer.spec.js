import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { createServer } from 'http-server'
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select'
import SpreadsheetViewer from '@/components/document/viewers/SpreadsheetViewer'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.component('b-form-select', bFormSelect)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SpreadsheetViewer.vue', () => {
  let httpServer, wrapper

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  beforeEach(() => {
    wrapper = shallowMount(SpreadsheetViewer, { localVue, i18n, propsData: { document: { url: 'spreadsheet.xlsx' } } })
  })

  afterAll(() => httpServer.close())

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.spreadsheet-viewer .alert').text()).toEqual('Generating preview...')
  })

  it('should display an error message if the document does not exist', async () => {
    const wrapper = shallowMount(SpreadsheetViewer, { localVue, i18n, propsData: { document: { url: 'nodoc.xlsx' } } })

    await wrapper.vm.getWorkbook()

    expect(wrapper.find('.spreadsheet-viewer .alert').text()).toContain('404 Not Found')
  })

  it('should load a csv content file', async () => {
    wrapper = shallowMount(SpreadsheetViewer, { localVue, i18n, propsData: { document: { url: 'spreadsheet.csv' } } })

    await wrapper.vm.getWorkbook()

    expect(wrapper.contains('.spreadsheet-viewer .spreadsheet-viewer__preview__content > div table')).toBeTruthy()
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content > div table td').at(0).text()).toBe('this')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content > div table td').at(1).text()).toBe('is')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content > div table td').at(2).text()).toBe('a')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content > div table td').at(3).text()).toBe('CSV')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content > div table td').at(4).text()).toBe('spreadsheet')
  })

  it('should load a xlsx content file', async () => {
    await wrapper.vm.getWorkbook()

    expect(wrapper.contains('.spreadsheet-viewer .spreadsheet-viewer__preview__content > div table')).toBeTruthy()
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content table td').at(0).text()).toBe('this')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content table td').at(1).text()).toBe('is')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content table td').at(2).text()).toBe('a')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content table td').at(3).text()).toBe('XLSX')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content table td').at(4).text()).toBe('spreadsheet')
  })

  it('should change the displayed sheet', async () => {
    wrapper = mount(SpreadsheetViewer, { localVue, i18n, propsData: { document: { url: 'spreadsheet.xlsx' } } })

    await wrapper.vm.getWorkbook()
    wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__header option').at(1).setSelected()

    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content table td').at(0).text()).toBe('second')
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__preview__content table td').at(1).text()).toBe('sheet')
  })

  it('should display a thumbnail by page', async () => {
    await wrapper.vm.getWorkbook()

    expect(wrapper.find('.spreadsheet-viewer .spreadsheet-viewer__header .spreadsheet-viewer__header__thumbnails').exists()).toBeTruthy()
    expect(wrapper.findAll('.spreadsheet-viewer .spreadsheet-viewer__header .spreadsheet-viewer__header__thumbnails .img-thumbnail')).toHaveLength(2)
  })
})
