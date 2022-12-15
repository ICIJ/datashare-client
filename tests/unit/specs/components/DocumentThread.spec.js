import { createLocalVue, shallowMount } from '@vue/test-utils'

import DocumentThread from '@/components/DocumentThread'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('DocumentThread.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const { index, es } = esConnectionHelper.build()
  let wrapper = null

  describe('getThread', () => {
    it('should filter on contentType to retrieve emails only', async () => {
      await letData(es).have(new IndexedDocument('document_01', index)
        .withMetadata({
          tika_metadata_subject: 'subject',
          tika_metadata_meta_creation_date: '2020-12-04T00:00:01Z'
        })
        .withContentType('application/vnd.ms-outlook')
      ).commit()
      await letData(es).have(new IndexedDocument('document_02', index)
        .withMetadata({ tika_metadata_subject: 'subject' })
        .withContentType('application/vnd.ms-outlook')
      ).commit()
      await letData(es).have(new IndexedDocument('document_03', index)
        .withMetadata({ tika_metadata_subject: 'subject' })
        .withContentType('message/rfc822')
      ).commit()
      await letData(es).have(new IndexedDocument('document_04', index)
        .withMetadata({ tika_metadata_subject: 'subject' })
        .withContentType('application/pdf')
      ).commit()
      await store.dispatch('document/get', { id: 'document_01', index })
      wrapper = shallowMount(DocumentThread, {
        i18n,
        localVue,
        store,
        wait,
        propsData: {
          document: store.state.document.doc
        }
      })
      const thread = await wrapper.vm.getThread()

      expect(thread.total).toBe(3)
    })

    it('should retrieve emails with the exact match of the subject, whatever is before or after', async () => {
      await letData(es).have(new IndexedDocument('document_01', index)
        .withMetadata({
          tika_metadata_subject: 'term_01 term_02',
          tika_metadata_meta_creation_date: '2020-12-04T00:00:01Z'
        })
        .withContentType('application/vnd.ms-outlook')
      ).commit()
      await letData(es).have(new IndexedDocument('document_02', index)
        .withMetadata({ tika_metadata_subject: 'term_01' })
        .withContentType('application/vnd.ms-outlook')
      ).commit()
      await letData(es).have(new IndexedDocument('document_03', index)
        .withMetadata({ tika_metadata_subject: 'term_03 term_02' })
        .withContentType('application/vnd.ms-outlook')
      ).commit()
      await letData(es).have(new IndexedDocument('document_04', index)
        .withMetadata({ tika_metadata_subject: 'term_00 term_01 term_02 term_03' })
        .withContentType('application/vnd.ms-outlook')
      ).commit()
      await letData(es).have(new IndexedDocument('document_05', index)
        .withMetadata({ tika_metadata_subject: 'term_02 term_01' })
        .withContentType('application/vnd.ms-outlook')
      ).commit()
      await store.dispatch('document/get', { id: 'document_01', index })
      wrapper = shallowMount(DocumentThread, {
        i18n,
        localVue,
        store,
        wait,
        propsData: {
          document: store.state.document.doc
        }
      })
      const thread = await wrapper.vm.getThread()

      expect(thread.total).toBe(2)
    })
  })
})
