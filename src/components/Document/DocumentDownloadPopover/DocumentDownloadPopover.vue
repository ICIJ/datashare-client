<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DocumentDownloadPopoverSection from './DocumentDownloadPopoverSection'

import DisplayContentType from '@/components/Display/DisplayContentType'

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
   * Toggle value when the popover is open
   */
  modelValue: {
    type: Boolean
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
  }
})

const { locale, t } = useI18n()

const extensionWarning = computed(() => {
  const { standardExtension: extension } = props.document
  return t('documentDownloadPopover.extensionWarning', { extension })
})

const description = computed(() => {
  const descriptions = props.document.contentTypeDescription ?? {}
  const description = descriptions[locale.value] || descriptions.en
  return props.document.hasStandardExtension ? description : `${description} <strong>${extensionWarning.value}</strong>`
})

const executionWarning = computed(() => {
  const warnings = props.document.contentTypeWarning ?? {}
  return warnings[locale.value] || warnings.en
})
</script>

<template>
  <b-popover
    teleport-to="body"
    :target="target"
    :manual="manual"
    :model-value="modelValue"
    :no-auto-close="noAutoClose"
    :placement="placement"
    custom-class="document-download-popover"
    @update:modelValue="$emit('update:modelValue')"
  >
    <div class="document-download-popover__body">
      <icon-button icon-left="download-simple" label="Download" class="document-download-popover__body__button" />
      <icon-button
        icon-left="download-simple"
        label="Download without metadata"
        variant="outline-primary"
        class="document-download-popover__body__button"
      />
      <icon-button
        icon-left="download-simple"
        label="Download extract text"
        variant="outline-primary"
        class="document-download-popover__body__button"
      />
      <div class="document-download-popover__body__sections pt-3">
        <document-download-popover-section title="What's the document's title?" :value="document.title" />
        <document-download-popover-section title="What's the document's type">
          <phosphor-icon :name="document.contentTypeIcon" class="me-2" />
          <display-content-type :value="document.contentType" />
        </document-download-popover-section>
        <document-download-popover-section
          v-if="description"
          title="Once downloaded, how do I open it ?"
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

    &__button {
      white-space: nowrap;
      align-self: flex-start;
    }

    &__sections {
      margin-top: $spacer;
      display: flex;
      flex-direction: column;
      gap: $spacer-xl;
    }
  }
}
</style>
