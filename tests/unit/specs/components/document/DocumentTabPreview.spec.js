import { createLocalVue, shallowMount } from '@vue/test-utils'

import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import DocumentTabPreview from '@/components/document/DocumentTabPreview'
import { App } from '@/main'

const { localVue, i18n } = App.init(createLocalVue()).useAll()

describe('DocumentTabPreview', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es

  it('should call the LegacySpreadsheetViewer component for XLSX document', async () => {
    const document = await letData(es).have(new IndexedDocument()
      .withContent('')
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, i18n, propsData: { document } })
    const { name } = (await wrapper.vm.previewComponent()).default
    expect(name).toBe('LegacySpreadsheetViewer')
  })

  it('should call the LegacySpreadsheetViewer component for CSV document', async () => {
    const document = await letData(es).have(new IndexedDocument()
      .withContent('')
      .withContentType('text/csv'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, i18n, propsData: { document } })
    const { name } = (await wrapper.vm.previewComponent()).default
    expect(name).toBe('LegacySpreadsheetViewer')
  })

  it('should call the PdfViewer component for PDF document', async () => {
    const document = await letData(es).have(new IndexedDocument()
      .withContent('')
      .withContentType('application/pdf'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, i18n, propsData: { document } })
    const { name } = (await wrapper.vm.previewComponent()).default
    expect(name).toBe('PdfViewer')
  })

  it('should call the TiffViewer component for TIFF document', async () => {
    const document = await letData(es).have(new IndexedDocument()
      .withContent('')
      .withContentType('image/tiff'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, i18n, propsData: { document } })
    const { name } = (await wrapper.vm.previewComponent()).default
    expect(name).toBe('TiffViewer')
  })
})
