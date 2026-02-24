import { shallowMount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThread from '@/components/Document/DocumentThread'
import { useDocumentStore } from '@/store/modules'

describe('DocumentThread.vue', () => {
  const { index, es } = esConnectionHelper.build()

  let core, wrapper, documentStore

  beforeEach(() => {
    core = CoreSetup.init().useAll()
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
      const activeEmail = wrapper.find('.document-thread__list__email--active')
      expect(activeEmail.exists()).toBeTruthy()
      expect(activeEmail.find('document-translation-stub').exists()).toBeTruthy()
    })

    it('should not display DocumentTranslation for a collapsed email', async () => {
      await createThreadWithEmails()
      const emails = wrapper.findAll('.document-thread__list__email:not(.document-thread__list__email--active)')
      expect(emails.length).toBeGreaterThan(0)
      expect(emails[0].find('document-translation-stub').exists()).toBeFalsy()
    })

    it('should show excerpt for a collapsed email', async () => {
      await createThreadWithEmails()
      const emails = wrapper.findAll('.document-thread__list__email:not(.document-thread__list__email--active)')
      expect(emails.length).toBeGreaterThan(0)
      expect(emails[0].find('.document-thread__list__email__excerpt').exists()).toBeTruthy()
    })

    it('should expand a non-active email on toggle and show DocumentTranslation', async () => {
      await createThreadWithEmails()
      const otherEmail = thread.hits.find(email => !wrapper.vm.isActive(email))
      wrapper.vm.toggleEmail(otherEmail)
      await nextTick()
      // After toggle, the non-active email should now show DocumentTranslation
      const emails = wrapper.findAll('.document-thread__list__email:not(.document-thread__list__email--active)')
      expect(emails[0].find('document-translation-stub').exists()).toBeTruthy()
    })

    it('should hide excerpt when email is expanded', async () => {
      await createThreadWithEmails()
      const otherEmail = thread.hits.find(email => !wrapper.vm.isActive(email))
      wrapper.vm.toggleEmail(otherEmail)
      await nextTick()
      const emails = wrapper.findAll('.document-thread__list__email:not(.document-thread__list__email--active)')
      expect(emails[0].find('.document-thread__list__email__excerpt').exists()).toBeFalsy()
    })

    it('should collapse an expanded email on second toggle', async () => {
      await createThreadWithEmails()
      const otherEmail = thread.hits.find(email => !wrapper.vm.isActive(email))
      wrapper.vm.toggleEmail(otherEmail)
      await nextTick()
      wrapper.vm.toggleEmail(otherEmail)
      await nextTick()
      const emails = wrapper.findAll('.document-thread__list__email:not(.document-thread__list__email--active)')
      expect(emails[0].find('document-translation-stub').exists()).toBeFalsy()
    })

    it('should not collapse the active email on toggle', async () => {
      await createThreadWithEmails()
      const activeEmail = thread.hits.find(email => wrapper.vm.isActive(email))
      wrapper.vm.toggleEmail(activeEmail)
      await nextTick()
      const active = wrapper.find('.document-thread__list__email--active')
      expect(active.find('document-translation-stub').exists()).toBeTruthy()
    })

    it('should not show chevron icon for the active email', async () => {
      await createThreadWithEmails()
      const active = wrapper.find('.document-thread__list__email--active')
      expect(active.find('.document-thread__list__email__chevron').exists()).toBeFalsy()
    })

    it('should show chevron icon for a non-active email', async () => {
      await createThreadWithEmails()
      const emails = wrapper.findAll('.document-thread__list__email:not(.document-thread__list__email--active)')
      expect(emails.length).toBeGreaterThan(0)
      expect(emails[0].find('.document-thread__list__email__chevron').exists()).toBeTruthy()
    })
  })
})
