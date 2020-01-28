import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import Document from '@/api/resources/Document'
import DocumentTypeCard from '@/components/DocumentTypeCard'

const { localVue, i18n } = App.init(createLocalVue()).useAll()

describe('DocumentTypeCard.vue', () => {
  it('should display warning message', () => {
    const wrapper = shallowMount(DocumentTypeCard, {
      localVue,
      i18n,
      propsData: {
        document: new Document({
          _id: 1,
          _source: {
            contentType: 'application/vnd.ms-word.document.macroenabled.12'
          }
        })
      }
    })

    expect(wrapper.findAll('.document-type-card .bg-warning')).toHaveLength(1)
    expect(wrapper.find('.document-type-card .bg-warning').text()).toBe('This file contains executable code. Ensure you have macros disabled before opening it.')
  })
})
