import DocumentTypeCard from '@/components/DocumentTypeCard'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Document from '@/api/Document'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en'
import Murmur from '@icij/murmur'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

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
