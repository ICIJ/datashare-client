import { computed, ref, toRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import range from 'lodash/range'

import { apiInstance as api } from '@/api/apiInstance'
import { useDocumentDownloadStore, useDocumentStore } from '@/store/modules'
import { useStructureArtifact } from '@/composables/useStructureArtifact'
import { useToast } from '@/composables/useToast'
import { downloadBlob } from '@/utils/download'
import settings from '@/utils/settings'

const TEXT_MIME_TYPE = 'text/plain;charset=UTF-8'
const MARKDOWN_MIME_TYPE = 'text/markdown;charset=UTF-8'

// Blank lines on both sides of the rule: `---` directly under a text line is a
// setext heading underline, not a page break.
const MARKDOWN_PAGE_SEPARATOR = '\n\n---\n\n'

export function useDocumentDownload(document, { immediate = true } = {}) {
  const documentStore = useDocumentStore()
  const documentDownloadStore = useDocumentDownloadStore()
  const { toastedPromise } = useToast()
  const { locale, t } = useI18n()

  const documentRef = toRef(document)

  const extensionWarning = computed(() => {
    const { standardExtension: extension } = documentRef.value
    return t('documentDownloadPopover.extensionWarning', { extension })
  })

  const description = computed(() => {
    const descriptions = documentRef.value.contentTypeDescription ?? {}
    const description = descriptions[locale.value] || descriptions.en || ''
    return showExtensionWarning.value ? `${description} ${extensionWarning.value}` : description
  })

  const showExtensionWarning = computed(() => {
    return !documentRef.value.hasStandardExtension && !executionWarning.value
  })

  const executionWarning = computed(() => {
    const warnings = documentRef.value.contentTypeWarning ?? {}
    return warnings[locale.value] || warnings.en
  })

  const documentFullUrl = computed(() => {
    return documentRef.value.fullUrl
  })

  const documentFullUrlWithoutMetadata = computed(() => {
    return documentRef.value.fullUrl + '&filter_metadata=true'
  })

  const rootDocumentFullUrl = computed(() => {
    return documentRef.value.fullRootUrl
  })

  const hasRoot = computed(() => {
    return !!documentRef.value.root
  })

  const hasCleanableContentType = computed(() => {
    return settings.cleanableContentTypes.includes(documentRef.value.contentType)
  })

  const isDownloadAllowed = computed(() => {
    return documentDownloadStore.isDownloadable(documentRef.value)
  })

  async function fetchDownloadStatus() {
    const { index = null, id = null } = documentRef.value
    // If the index or the id is null, this means the document is not loaded
    // yet and therefore, we should not probe its download status
    if (index && id) {
      await documentDownloadStore.fetchDocumentStatus(documentRef.value)
    }
  }

  const hasTextContent = computed(() => {
    return documentRef.value.contentTextLength > 0
  })

  async function downloadTextContent() {
    if (!hasTextContent.value) {
      return
    }
    if (!documentRef.value.content) {
      await documentStore.getContent()
    }
    const { content, title } = documentRef.value
    downloadBlob(content, `${title}.txt`, TEXT_MIME_TYPE)
  }

  const availableTranslations = ref([])

  const hasTranslations = computed(() => {
    return availableTranslations.value.length > 0
  })

  async function fetchTranslationStatus() {
    const { index, id, routing } = documentRef.value
    if (!index || !id) {
      return
    }
    availableTranslations.value = await documentDownloadStore.fetchTranslationStatus({ index, id, routing })
  }

  const { hasMarkdown, pages: markdownPages, fetchManifest: fetchMarkdownStatus } = useStructureArtifact(documentRef)

  const isDownloadingMarkdown = ref(false)

  async function fetchMarkdownPages() {
    const { index, id, routing } = documentRef.value
    const requests = range(1, markdownPages.value + 1).map(page => api.getStructurePage(index, id, page, routing))
    const errorMessage = t('documentDownloadPopover.downloadMarkdownError')
    return toastedPromise(Promise.all(requests), { errorMessage })
  }

  async function downloadMarkdown() {
    if (!hasMarkdown.value || isDownloadingMarkdown.value) {
      return
    }
    // Captured before the fetch: the pages belong to the document that was
    // clicked, so the filename must not follow a later document.
    const { title } = documentRef.value
    isDownloadingMarkdown.value = true
    try {
      const pages = await fetchMarkdownPages()
      downloadBlob(pages.join(MARKDOWN_PAGE_SEPARATOR), `${title}.md`, MARKDOWN_MIME_TYPE)
    }
    catch {
      // toastedPromise already reported the failure; swallow the rejection so
      // it doesn't escape the template's click handler.
    }
    finally {
      isDownloadingMarkdown.value = false
    }
  }

  async function downloadTranslatedContent() {
    if (!documentRef.value.content) {
      await documentStore.getContent()
    }

    const { translations, title } = documentRef.value
    const targetLanguage = translations[0]?.target_language ?? availableTranslations.value[0]?.target_language
    const translatedContent = documentRef.value.translatedContentIn(targetLanguage)
    downloadBlob(translatedContent, `${title}.txt`, TEXT_MIME_TYPE)
  }

  async function fetchStatuses() {
    await Promise.all([fetchDownloadStatus(), fetchTranslationStatus(), fetchMarkdownStatus()])
  }

  if (immediate) {
    watchEffect(fetchDownloadStatus)
    watchEffect(fetchTranslationStatus)
    watchEffect(fetchMarkdownStatus)
  }

  return {
    fetchStatuses,
    fetchDownloadStatus,
    fetchTranslationStatus,
    extensionWarning,
    description,
    showExtensionWarning,
    executionWarning,
    documentFullUrl,
    documentFullUrlWithoutMetadata,
    rootDocumentFullUrl,
    hasRoot,
    hasCleanableContentType,
    isDownloadAllowed,
    downloadTextContent,
    hasTextContent,
    hasTranslations,
    downloadTranslatedContent,
    hasMarkdown,
    downloadMarkdown,
    isDownloadingMarkdown
  }
}
