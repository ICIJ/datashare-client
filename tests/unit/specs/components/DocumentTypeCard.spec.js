import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Document from '@/api/resources/Document'
import DocumentTypeCard from '@/components/DocumentTypeCard'

const { plugins } = CoreSetup.init().useAll()

describe('DocumentTypeCard.vue', () => {
  it('should display warning message', () => {
    const wrapper = shallowMount(DocumentTypeCard, {
      global: {
        plugins
      },
      props: {
        document: new Document({
          _id: 1,
          _source: {
            contentType: 'application/vnd.ms-word.document.macroenabled.12'
          }
        })
      }
    })

    expect(wrapper.findAll('.document-type-card .bg-warning')).toHaveLength(1)
    expect(wrapper.find('.document-type-card .bg-warning').text()).toBe(
      'This file contains executable code. Ensure you have macros disabled before opening it.'
    )
  })
})
