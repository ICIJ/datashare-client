import { computed, ref, toRef, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { range } from 'lodash'

import { apiInstance as api } from '@/api/apiInstance'
import { useDocumentDownloadStore, useDocumentStore } from '@/store/modules'
import { useToast } from '@/composables/useToast'
import { downloadBlob } from '@/utils/download'
import settings from '@/utils/settings'

const TEXT_MIME_TYPE = 'text/plain;charset=UTF-8'
const MARKDOWN_MIME_TYPE = 'text/markdown;charset=UTF-8'
const MARKDOWN_FORMAT = 'md'

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

  // The manifest carries the id of the document it describes: a component
  // handed another document (a recycled row, a slow probe resolving after the
  // user moved on) must not offer the page count of the previous one.
  const structureManifest = ref(null)

  const hasMarkdown = computed(() => {
    const { documentId, pages = 0, formats = [] } = structureManifest.value ?? {}
    return documentId === documentRef.value.id && pages > 0 && formats.includes(MARKDOWN_FORMAT)
  })

  async function fetchMarkdownStatus() {
    const { index, id, routing } = documentRef.value
    if (!index || !id) {
      return
    }
    const manifest = await api.getStructureManifest(index, id, routing)
    structureManifest.value = { ...manifest, documentId: id }
  }

  const isDownloadingMarkdown = ref(false)

  async function downloadMarkdown() {
    if (!hasMarkdown.value || isDownloadingMarkdown.value) {
      return
    }
    const { index, id, routing, title } = documentRef.value
    const { pages } = structureManifest.value
    const numbers = range(1, pages + 1)
    isDownloadingMarkdown.value = true
    const promise = Promise.all(numbers.map(page => api.getStructurePage(index, id, page, routing)))
    let contents
    try {
      contents = await toastedPromise(promise, { errorMessage: t('documentDownloadPopover.downloadMarkdownError') })
    }
    catch {
      // toastedPromise already reported the error; swallow the rejection so it
      // doesn't escape the template click handler.
      return
    }
    finally {
      isDownloadingMarkdown.value = false
    }
    downloadBlob(contents.join(MARKDOWN_PAGE_SEPARATOR), `${title}.md`, MARKDOWN_MIME_TYPE)
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
