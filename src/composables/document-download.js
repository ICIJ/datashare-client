import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/core'
import settings from '@/utils/settings'
import byteSize from '@/utils/byteSize'

export function useDocumentDownload(document) {
  const { core } = useCore()
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

  const embeddedDocumentDownloadMaxSize = computed(() => {
    return core?.config?.get('embeddedDocumentDownloadMaxSize')
  })

  const isRootTooBig = computed(() => {
    return hasRoot.value && rootContentLength.value > maxRootContentLength.value
  })

  const rootContentLength = computed(() => {
    return documentRef.value?.root?.contentLength
  })

  const maxRootContentLength = computed(() => {
    return byteSize(embeddedDocumentDownloadMaxSize.value)
  })

  return {
    extensionWarning,
    description,
    showExtensionWarning,
    executionWarning,
    documentFullUrl,
    documentFullUrlWithoutMetadata,
    rootDocumentFullUrl,
    hasRoot,
    hasCleanableContentType,
    embeddedDocumentDownloadMaxSize,
    isRootTooBig,
    rootContentLength,
    maxRootContentLength
  }
}
