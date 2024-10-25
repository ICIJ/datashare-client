<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DocumentDownloadPopoverSection from './DocumentDownloadPopoverSection'

import DisplayContentType from '@/components/Display/DisplayContentType'
import DismissableAlert from '@/components/Dismissable/DismissableAlert'
import byteSize from '@/utils/byteSize'
import ButtonIcon from '@/components/Button/ButtonIcon'

/**
 * Toggle value when the popover is open
 */
const modelValue = defineModel({ type: Boolean })

const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object
  },
  /**
   * The target element
   */
  target: {
    type: Object
  },
  /**
   * True if the popover is open manually
   */
  manual: {
    type: Boolean
  },
  /**
   * Disable auto close
   */
  noAutoClose: {
    type: Boolean
  },
  /**
   * The placement of the popover
   */
  placement: {
    type: String
  },
  /**
   * List of content type that can be cleaned
   */
  cleanableContentTypes: {
    type: Array,
    default: () => ['application/pdf', 'application/msword']
  },
  /**
   * The maximum allowed size to download an embedded document
   */
  embeddedDocumentDownloadMaxSize: {
    type: String,
    default: '1G'
  }
})

const { locale, t } = useI18n()

const extensionWarning = computed(() => {
  const { standardExtension: extension } = props.document
  return t('documentDownloadPopover.extensionWarning', { extension })
})

const description = computed(() => {
  const descriptions = props.document.contentTypeDescription ?? {}
  const description = descriptions[locale.value] || descriptions.en || ''
  return showExtensionWarning.value ? `${description} ${extensionWarning.value}` : description
})

const showExtensionWarning = computed(() => {
  return !props.document.hasStandardExtension && !executionWarning.value
})

const executionWarning = computed(() => {
  const warnings = props.document.contentTypeWarning ?? {}
  return warnings[locale.value] || warnings.en
})

const documentFullUrl = computed(() => {
  return props.document.fullUrl
})

const documentFullUrlWithoutMetadata = computed(() => {
  return props.document.fullUrl + '&filter_metadata=true'
})

const rootDocumentFullUrl = computed(() => {
  return props.document.fullRootUrl
})

const hasRoot = computed(() => {
  return !!props.document.root
})

const hasCleanableContentType = computed(() => {
  return props.cleanableContentTypes.includes(props.document.contentType)
})

const isRootTooBig = computed(() => {
  return hasRoot.value && rootContentLength.value > maxRootContentLength.value
})

const rootContentLength = computed(() => {
  return props.document?.root?.contentLength
})

const maxRootContentLength = computed(() => {
  return byteSize(props.embeddedDocumentDownloadMaxSize)
})
</script>

<template>
  <b-popover
    v-model="modelValue"
    teleport-to="body"
    :target="target"
    :manual="manual"
    :no-auto-close="noAutoClose"
    :placement="placement"
    custom-class="document-download-popover"
  >
    <div class="document-download-popover__body">
      <button-icon
        :disabled="isRootTooBig"
        :href="documentFullUrl"
        :label="$t('documentDownloadPopover.download')"
        icon-left="download-simple"
        class="document-download-popover__body__button"
      />
      <button-icon
        v-if="hasCleanableContentType"
        icon-left="download-simple"
        :href="documentFullUrlWithoutMetadata"
        :label="$t('documentDownloadPopover.downloadWithoutMetadata')"
        variant="outline-action"
        class="document-download-popover__body__button"
      />
      <button-icon
        icon-left="download-simple"
        :href="document"
        :label="$t('documentDownloadPopover.downloadExtractText')"
        variant="outline-action"
        class="document-download-popover__body__button"
      />
      <button-icon
        v-if="hasRoot"
        icon-left="download-simple"
        :href="rootDocumentFullUrl"
        :label="$t('documentDownloadPopover.downloadRoot')"
        variant="outline-action"
        class="document-download-popover__body__button"
      />
      <div class="document-download-popover__body__sections">
        <document-download-popover-section
          :title="$t('documentDownloadPopover.sectionTitle')"
          :value="document.title"
        />
        <document-download-popover-section :title="$t('documentDownloadPopover.sectionContentType')">
          <phosphor-icon :name="document.contentTypeIcon" class="me-2" />
          <display-content-type :value="document.contentType" />
        </document-download-popover-section>
        <document-download-popover-section v-if="executionWarning">
          <dismissable-alert class="m-0" no-close no-button bordered icon-class="align-self-start" variant="warning">
            {{ executionWarning }}
          </dismissable-alert>
        </document-download-popover-section>
        <document-download-popover-section
          v-if="description"
          :title="$t('documentDownloadPopover.sectionDescription')"
          :value="description"
        />
      </div>
    </div>
  </b-popover>
</template>

<style lang="scss">
.document-download-popover {
  width: 100%;

  &__body {
    display: flex;
    flex-direction: column;
    gap: $spacer-sm;

    .bs-popover-top & {
      flex-direction: column-reverse;
    }

    &__button {
      white-space: nowrap;
      align-self: flex-start;
    }

    &__sections {
      margin-top: $spacer;
      display: flex;
      flex-direction: column;
      gap: $spacer;

      .bs-popover-top & {
        margin-top: 0;
        margin-bottom: $spacer;
      }
    }
  }
}
</style>
