import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThread from '@/components/Document/DocumentThread/DocumentThread'
import { useDocumentStore } from '@/store/modules'

describe('DocumentThread.vue', () => {
  const { index, es } = esConnectionHelper.build()

  let core, wrapper, documentStore

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    documentStore = useDocumentStore()
  })

  describe('get thread', () => {
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
      await documentStore.getDocument({ id: 'document_01', index })

      wrapper = shallowMount(DocumentThread, {
        global: {
          plugins: core.plugins
        },
        props: {
          document: documentStore.document
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
      await documentStore.getDocument({ id: 'document_01', index })
      wrapper = shallowMount(DocumentThread, {
        global: {
          plugins: core.plugins
        },
        props: {
          document: documentStore.document
        }
      })

      const thread = await wrapper.vm.getThread()

      expect(thread.total).toBe(2)
    })
  })

  describe('toggle expand', () => {
    let thread

    async function createThreadWithEmails(activeId = 'email_active') {
      await letData(es)
        .have(
          new IndexedDocument('email_active', index)
            .withMetadata({ tika_metadata_dc_subject: 'thread subject' })
            .withCreationDate('2020-12-04T00:00:01Z')
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await letData(es)
        .have(
          new IndexedDocument('email_other', index)
            .withMetadata({ tika_metadata_dc_subject: 'thread subject' })
            .withCreationDate('2020-12-04T00:00:02Z')
            .withContentType('application/vnd.ms-outlook')
        )
        .commit()
      await documentStore.getDocument({ id: activeId, index })
      wrapper = shallowMount(DocumentThread, {
        global: {
          plugins: core.plugins,
          renderStubDefaultSlot: true
        },
        props: {
          document: documentStore.document
        }
      })
      // Wait for the async init to complete
      await wrapper.vm.init()
      await flushPromises()
      thread = wrapper.vm.thread
    }

    it('should display DocumentTranslation for the active email', async () => {
      await createThreadWithEmails()
      const entries = wrapper.findAllComponents({ name: 'DocumentThreadEntry' })
      const activeEntry = entries.find(e => e.props('active'))
      expect(activeEntry).toBeTruthy()
      expect(activeEntry.props('expanded')).toBe(true)
    })

    it('should not expand a non-active email by default', async () => {
      await createThreadWithEmails()
      const entries = wrapper.findAllComponents({ name: 'DocumentThreadEntry' })
      const inactiveEntry = entries.find(e => !e.props('active'))
      expect(inactiveEntry).toBeTruthy()
      expect(inactiveEntry.props('expanded')).toBe(false)
    })

    it('should expand a non-active email on toggle', async () => {
      await createThreadWithEmails()
      const otherEmail = thread.hits.find(email => !wrapper.vm.isActive(email))
      wrapper.vm.toggleEmail(otherEmail)
      await nextTick()
      const entries = wrapper.findAllComponents({ name: 'DocumentThreadEntry' })
      const inactiveEntry = entries.find(e => !e.props('active'))
      expect(inactiveEntry.props('expanded')).toBe(true)
    })

    it('should collapse an expanded email on second toggle', async () => {
      await createThreadWithEmails()
      const otherEmail = thread.hits.find(email => !wrapper.vm.isActive(email))
      wrapper.vm.toggleEmail(otherEmail)
      await nextTick()
      wrapper.vm.toggleEmail(otherEmail)
      await nextTick()
      const entries = wrapper.findAllComponents({ name: 'DocumentThreadEntry' })
      const inactiveEntry = entries.find(e => !e.props('active'))
      expect(inactiveEntry.props('expanded')).toBe(false)
    })

    it('should not collapse the active email on toggle', async () => {
      await createThreadWithEmails()
      const activeEmail = thread.hits.find(email => wrapper.vm.isActive(email))
      wrapper.vm.toggleEmail(activeEmail)
      await nextTick()
      const entries = wrapper.findAllComponents({ name: 'DocumentThreadEntry' })
      const activeEntry = entries.find(e => e.props('active'))
      expect(activeEntry.props('expanded')).toBe(true)
    })
  })
})
