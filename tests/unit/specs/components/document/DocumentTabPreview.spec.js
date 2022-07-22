import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

import DocumentTabPreview from '@/components/document/DocumentTabPreview'
import { Core } from '@/core'

describe('DocumentTabPreview.vue', () => {
  const { localVue } = Core.init(createLocalVue()).useAll()
  const { index, es } = esConnectionHelper.build()
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

  it('should call the PaginatedViewer component for PDF document', async () => {
    const document = await letData(es).have(new IndexedDocument(id, index)
      .withContentType('application/pdf'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, propsData: { document, disabled }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.previewComponent).toBe('PaginatedViewer')
  })

  it('should call the TiffViewer component for TIFF document', async () => {
    const document = await letData(es).have(new IndexedDocument(id, index)
      .withContentType('image/tiff'))
      .commitAndGetLastDocument()

    const wrapper = shallowMount(DocumentTabPreview, { localVue, propsData: { document, disabled }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.previewComponent).toBe('TiffViewer')
  })
})
