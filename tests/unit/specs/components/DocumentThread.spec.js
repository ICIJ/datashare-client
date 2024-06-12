import { shallowMount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThread from '@/components/DocumentThread'

describe('DocumentThread.vue', () => {
  const { index, es } = esConnectionHelper.build()

  let core, store, wrapper

  beforeEach(() => {
    const api = { elasticsearch: es }
    core = CoreSetup.init(api).useAll()
    store = core.store
  })

  describe('getThread', () => {
    it('should filter on contentType to retrieve emails only', async () => {
      await letData(es)
        .have(
          new IndexedDocument('document_01', index)
            .withMetadata({
              tika_metadata_dc_subject: 'subject'
            })
            .withCreationDate('2020-12-04T00:00:01Z')
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('document_02', index)
            .withMetadata({ tika_metadata_dc_subject: 'subject' })
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('document_03', index)
            .withMetadata({ tika_metadata_dc_subject: 'subject' })
            .withContentType('message/rfc822')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('document_04', index)
            .withMetadata({ tika_metadata_dc_subject: 'subject' })
            .withContentType('application/pdf')
        )
        .commit()
      await store.dispatch('document/get', { id: 'document_01', index })

      wrapper = shallowMount(DocumentThread, {
        global: {
          plugins: core.plugins
        },
        props: {
          document: store.state.document.doc
        }
      })

      const thread = await wrapper.vm.getThread()

      expect(thread.total).toBe(3)
    })

    it('should retrieve emails with the exact match of the subject, whatever is before or after', async () => {
      await letData(es)
        .have(
          new IndexedDocument('document_01', index)
            .withMetadata({
              tika_metadata_dc_subject: 'term_01 term_02'
            })
            .withCreationDate('2020-12-04T00:00:01Z')
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('document_02', index)
            .withMetadata({ tika_metadata_dc_subject: 'term_01' })
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('document_03', index)
            .withMetadata({ tika_metadata_dc_subject: 'term_03 term_02' })
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('document_04', index)
            .withMetadata({ tika_metadata_dc_subject: 'term_00 term_01 term_02 term_03' })
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('document_05', index)
            .withMetadata({ tika_metadata_dc_subject: 'term_02 term_01' })
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await store.dispatch('document/get', { id: 'document_01', index })
      wrapper = shallowMount(DocumentThread, {
        global: {
          plugins: core.plugins
        },
        props: {
          document: store.state.document.doc
        }
      })

      const thread = await wrapper.vm.getThread()

      expect(thread.total).toBe(2)
    })
  })
})
