import { createLocalVue, mount, shallowMount } from '@vue/test-utils'

import { flushPromises, responseWithArrayBuffer as mockArrayBuffer } from '~tests/unit/tests_utils'
import LegacySpreadsheetViewer from '@/components/document/viewers/LegacySpreadsheetViewer'
import { Core } from '@/core'

describe('LegacySpreadsheetViewer.vue', () => {
  let wrapper, api, i18n, localVue
  beforeAll(async () => {
    api = { getSource: vi.fn(({ url }) => mockArrayBuffer(url, false)) }
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
  })

  beforeEach(() => {
    wrapper = shallowMount(LegacySpreadsheetViewer, { i18n, localVue })
  })

  it('should display an error message if the document does not exist', async () => {
    await wrapper.setProps({ document: { url: 'nodoc.xlsx' } })
    await wrapper.vm.getWorkbook()
    await flushPromises()

    expect(wrapper.find('.legacy-spreadsheet-viewer .alert').text()).toBe('document.error_not_found')
  })

  it('should load a csv content file', async () => {
    await wrapper.setProps({ document: { url: 'spreadsheet.csv' } })
    await wrapper.vm.getWorkbook()
    await flushPromises()

    expect(
      wrapper.find('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content > div table').element
    ).toBeTruthy()
    expect(
      wrapper
        .findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content > div table td')
        .at(0)
        .text()
    ).toBe('this')
    expect(
      wrapper
        .findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content > div table td')
        .at(1)
        .text()
    ).toBe('is')
    expect(
      wrapper
        .findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content > div table td')
        .at(2)
        .text()
    ).toBe('a')
    expect(
      wrapper
        .findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content > div table td')
        .at(3)
        .text()
    ).toBe('CSV')
    expect(
      wrapper
        .findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content > div table td')
        .at(4)
        .text()
    ).toBe('spreadsheet')
  })

  it('should load a xlsx content file', async () => {
    await wrapper.setProps({ document: { url: 'spreadsheet.xlsx' } })
    await wrapper.vm.getWorkbook()
    await flushPromises()

    expect(
      wrapper.find('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content > div table').element
    ).toBeTruthy()
    expect(
      wrapper.findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content table td').at(0).text()
    ).toBe('this')
    expect(
      wrapper.findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content table td').at(1).text()
    ).toBe('is')
    expect(
      wrapper.findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content table td').at(2).text()
    ).toBe('a')
    expect(
      wrapper.findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content table td').at(3).text()
    ).toBe('XLSX')
    expect(
      wrapper.findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content table td').at(4).text()
    ).toBe('spreadsheet')
  })

  it('should change the displayed sheet', async () => {
    wrapper = mount(LegacySpreadsheetViewer, { i18n, localVue, propsData: { document: { url: 'spreadsheet.xlsx' } } })
    await wrapper.vm.getWorkbook()
    await flushPromises()
    await wrapper
      .findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__header option')
      .at(1)
      .setSelected()

    expect(
      wrapper.findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content table td').at(0).text()
    ).toBe('second')
    expect(
      wrapper.findAll('.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__preview__content table td').at(1).text()
    ).toBe('sheet')
  })

  it('should display a thumbnail by page', async () => {
    await wrapper.setProps({ document: { url: 'spreadsheet.xlsx' } })
    await wrapper.vm.getWorkbook()
    await flushPromises()

    expect(
      wrapper
        .find(
          '.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__header .legacy-spreadsheet-viewer__header__thumbnails'
        )
        .exists()
    ).toBeTruthy()
    expect(
      wrapper.findAll(
        '.legacy-spreadsheet-viewer .legacy-spreadsheet-viewer__header .legacy-spreadsheet-viewer__header__thumbnails .img-thumbnail'
      )
    ).toHaveLength(2)
  })
})
