import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import SpreadsheetViewer from '@/components/document/SpreadsheetViewer'
import messages from '@/lang/en'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { createServer } from 'http-server'
import bFormSelect from 'bootstrap-vue/es/components/form-select/form-select'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.component('font-awesome-icon', FontAwesomeIcon)
localVue.component('b-form-select', bFormSelect)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SpreadsheetViewer.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let httpServer

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  afterAll(() => {
    httpServer.close()
  })

  it('should load a csv content file', async () => {
    const id = 'spreadsheet.csv'
    const wrapper = shallowMount(SpreadsheetViewer, { localVue, i18n, propsData: { document: { url: id } } })

    expect(wrapper.find('.spreadsheet-viewer__hot > div').text()).toEqual('')

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('text/csv'))
      .commit()

    expect(wrapper.contains('.spreadsheet-viewer__hot > div table')).toBeTruthy()
    expect(wrapper.findAll('.spreadsheet-viewer__hot > div table td').at(0).text()).toBe('this')
    expect(wrapper.findAll('.spreadsheet-viewer__hot > div table td').at(1).text()).toBe('is')
    expect(wrapper.findAll('.spreadsheet-viewer__hot > div table td').at(2).text()).toBe('a')
    expect(wrapper.findAll('.spreadsheet-viewer__hot > div table td').at(3).text()).toBe('CSV')
    expect(wrapper.findAll('.spreadsheet-viewer__hot > div table td').at(4).text()).toBe('spreadsheet')
  })

  it('should load a xlsx content file', async () => {
    const id = 'spreadsheet.xlsx'
    const wrapper = shallowMount(SpreadsheetViewer, { localVue, i18n, propsData: { document: { url: id } } })

    expect(wrapper.find('.spreadsheet-viewer__hot > div').text()).toEqual('')

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
      .commit()

    expect(wrapper.contains('.spreadsheet-viewer__hot > div table')).toBeTruthy()
    expect(wrapper.findAll('.spreadsheet-viewer__hot table td').at(0).text()).toBe('this')
    expect(wrapper.findAll('.spreadsheet-viewer__hot table td').at(1).text()).toBe('is')
    expect(wrapper.findAll('.spreadsheet-viewer__hot table td').at(2).text()).toBe('a')
    expect(wrapper.findAll('.spreadsheet-viewer__hot table td').at(3).text()).toBe('XLSX')
    expect(wrapper.findAll('.spreadsheet-viewer__hot table td').at(4).text()).toBe('spreadsheet')
  })

  it('should change the displayed sheet', async () => {
    const id = 'spreadsheet.xlsx'
    const wrapper = mount(SpreadsheetViewer, { localVue, i18n, propsData: { document: { url: id } } })

    await letData(es).have(new IndexedDocument(id)
      .withContent('')
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
      .commit()
    wrapper.findAll('.spreadsheet-viewer__header option').at(1).setSelected()

    expect(wrapper.findAll('.spreadsheet-viewer__hot table td').at(0).text()).toBe('second')
    expect(wrapper.findAll('.spreadsheet-viewer__hot table td').at(1).text()).toBe('sheet')
  })
})
