import Murmur from '@icij/murmur'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { createServer } from 'http-server'
import SpreadsheetViewer from '@/components/document/viewers/SpreadsheetViewer'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(BootstrapVue)

describe('SpreadsheetViewer.vue', () => {
  let httpServer, wrapper

  beforeAll(() => {
    httpServer = createServer({ root: 'tests/unit/resources' })
    httpServer.listen(9876)
  })

  beforeEach(() => {
    wrapper = shallowMount(SpreadsheetViewer, { localVue, propsData: { document: { url: 'spreadsheet.xlsx' } }, mocks: { $t: msg => msg } })
  })

  afterAll(() => httpServer.close())

  it('should display a message while generating the preview', () => {
    expect(wrapper.find('.spreadsheet-viewer .alert').text()).toEqual('document.generating_preview')
  })

  it('should display an error message if the document does not exist', async () => {
    const wrapper = shallowMount(SpreadsheetViewer, { localVue, propsData: { document: { url: 'nodoc.xlsx' } }, mocks: { $t: msg => msg } })

    await wrapper.vm.getWorkbook()

    expect(wrapper.find('.spreadsheet-viewer .alert').text()).toContain('document.error_not_found')
  })

  it('should load a csv content file', async () => {
    wrapper = shallowMount(SpreadsheetViewer, { localVue, propsData: { document: { url: 'spreadsheet.csv' } }, mocks: { $t: msg => msg } })

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
    wrapper = mount(SpreadsheetViewer, { localVue, propsData: { document: { url: 'spreadsheet.xlsx' } }, mocks: { $t: msg => msg } })

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
