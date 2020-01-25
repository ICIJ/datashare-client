import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

import DocumentTabPreview from '@/components/document/DocumentTabPreview'
import { App } from '@/main'

const { localVue } = App.init(createLocalVue()).useAll()

describe('DocumentTabPreview.vue', () => {
  const index = toLower('DocumentTabPreview')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  const id = 'document'
  const disabled = true

  it('should call the LegacySpreadsheetViewer component for XLSX document', async () => {
    const document = await letData(es).have(new IndexedDocument(id, index)
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, propsData: { document, disabled }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.previewComponent).toBe('LegacySpreadsheetViewer')
  })

  it('should call the LegacySpreadsheetViewer component for CSV document', async () => {
    const document = await letData(es).have(new IndexedDocument(id, index)
      .withContentType('text/csv'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, propsData: { document, disabled }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.previewComponent).toBe('LegacySpreadsheetViewer')
  })

  it('should call the PdfViewer component for PDF document', async () => {
    const document = await letData(es).have(new IndexedDocument(id, index)
      .withContentType('application/pdf'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, propsData: { document, disabled }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.previewComponent).toBe('PdfViewer')
  })

  it('should call the TiffViewer component for TIFF document', async () => {
    const document = await letData(es).have(new IndexedDocument(id, index)
      .withContentType('image/tiff'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, propsData: { document, disabled }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.previewComponent).toBe('TiffViewer')
  })
})
