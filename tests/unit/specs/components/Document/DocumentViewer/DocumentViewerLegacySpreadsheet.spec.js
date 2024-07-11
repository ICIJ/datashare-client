import { mount } from '@vue/test-utils'

import { flushPromises, responseWithArrayBuffer as mockArrayBuffer } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewerLegacySpreadsheet from '@/components/Document/DocumentViewer/DocumentViewerLegacySpreadsheet'

describe('DocumentViewerLegacySpreadsheet.vue', () => {
  let wrapper

  beforeEach(() => {
    const api = { getSource: vi.fn(({ url }) => mockArrayBuffer(url, false)) }
    const { plugins } = CoreSetup.init(api).useAll()
    wrapper = mount(DocumentViewerLegacySpreadsheet, { global: { plugins, renderStubDefaultSlot: true } })
  })

  it('should load a csv content file', async () => {
    await wrapper.setProps({ document: { url: 'spreadsheet.csv' } })
    await wrapper.vm.generateWorkbook()
    await flushPromises()

    expect(wrapper.find('.legacy-spreadsheet-viewer__content table').exists()).toBeTruthy()
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(0).text()).toBe('this')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(1).text()).toBe('is')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(2).text()).toBe('a')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(3).text()).toBe('CSV')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(4).text()).toBe('spreadsheet')
  })

  it('should load a xlsx content file', async () => {
    await wrapper.setProps({ document: { url: 'spreadsheet.xlsx' } })
    await wrapper.vm.generateWorkbook()
    await flushPromises()

    expect(wrapper.find('.legacy-spreadsheet-viewer__content table').exists()).toBeTruthy()
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(0).text()).toBe('this')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(1).text()).toBe('is')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(2).text()).toBe('a')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(3).text()).toBe('XLSX')
    expect(wrapper.findAll('.legacy-spreadsheet-viewer__content table td').at(4).text()).toBe('spreadsheet')
  })
})
