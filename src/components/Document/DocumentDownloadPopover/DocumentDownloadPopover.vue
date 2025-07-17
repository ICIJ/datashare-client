<script setup>
import { useTemplateRef } from 'vue'
import { PhosphorIcon, ButtonIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import DocumentDownloadPopoverSection from './DocumentDownloadPopoverSection'

import { useDocumentDownload } from '@/composables/useDocumentDownload'
import AppPopover from '@/components/AppPopover/AppPopover'
import DisplayContentType from '@/components/Display/DisplayContentType'
import DismissableAlert from '@/components/Dismissable/DismissableAlert'

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
  }
})
const { t } = useI18n()

const {
  description,
  executionWarning,
  documentFullUrl,
  documentFullUrlWithoutMetadata,
  rootDocumentFullUrl,
  hasRoot,
  hasCleanableContentType,
  isRootTooBig,
  downloadTextContent
} = useDocumentDownload(props.document)

const popoverRef = useTemplateRef('popover')

defineExpose({
  popoverRef,
  hide() {
    popoverRef.value.hide()
  },
  show() {
    popoverRef.value.show()
  }
})
</script>

<template>
  <app-popover ref="popover" v-model="modelValue" hide-header class="document-download-popover">
    <template #target="binding">
      <slot name="target" v-bind="binding" />
    </template>
    <div class="document-download-popover__body">
      <button-icon
        :disabled="isRootTooBig"
        :href="documentFullUrl"
        :label="t('documentDownloadPopover.download')"
        icon-left="download-simple"
        class="document-download-popover__body__button"
        download
      />
      <button-icon
        v-if="hasCleanableContentType"
        icon-left="download-simple"
        :href="documentFullUrlWithoutMetadata"
        :label="t('documentDownloadPopover.downloadWithoutMetadata')"
        variant="outline-action"
        class="document-download-popover__body__button"
        download
      />
      <button-icon
        icon-left="download-simple"
        :label="t('documentDownloadPopover.downloadExtractText')"
        variant="outline-action"
        class="document-download-popover__body__button"
        @click="downloadTextContent"
      />
      <button-icon
        v-if="hasRoot"
        icon-left="download-simple"
        :href="rootDocumentFullUrl"
        :label="t('documentDownloadPopover.downloadRoot')"
        variant="outline-action"
        class="document-download-popover__body__button"
        download
      />
      <div class="document-download-popover__body__sections">
        <document-download-popover-section :title="t('documentDownloadPopover.sectionTitle')" :value="document.title" />
        <document-download-popover-section :title="t('documentDownloadPopover.sectionContentType')">
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
          :title="t('documentDownloadPopover.sectionDescription')"
          :value="description"
        />
      </div>
    </div>
  </app-popover>
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
