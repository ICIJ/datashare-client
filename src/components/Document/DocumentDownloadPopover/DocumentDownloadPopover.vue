<script setup>
import { ref, useTemplateRef, nextTick, computed } from 'vue'
import { whenever } from '@vueuse/core'
import { AppIcon, ButtonIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
import IPhDownloadSimple from '~icons/ph/download-simple'

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
  },
  /**
   * Lazy mount the popover only on first activation
   */
  lazy: {
    type: Boolean,
    default: true
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

// Lazy rendering: only mount the popover after it's been opened once
const activated = ref(false)
const mounted = computed(() => !props.lazy || activated.value)

// Activate when modelValue becomes true
whenever(modelValue, () => (activated.value = true), { once: true })

async function activate() {
  activated.value = true
  await nextTick()
  modelValue.value = true
}

defineExpose({
  popoverRef,
  hide() {
    popoverRef.value?.hide()
  },
  async show() {
    activated.value = true
    await nextTick()
    popoverRef.value?.show()
  }
})
</script>

<template>
  <app-popover
    v-if="mounted"
    ref="popover"
    v-model="modelValue"
    hide-header
    class="document-download-popover"
  >
    <template #target>
      <slot name="target" />
    </template>
    <div class="document-download-popover__body">
      <button-icon
        :disabled="isRootTooBig"
        :href="documentFullUrl"
        :label="t('documentDownloadPopover.download')"
        :icon-left="IPhDownloadSimple"
        class="document-download-popover__body__button"
        download
      />
      <button-icon
        v-if="hasCleanableContentType"
        :icon-left="IPhDownloadSimple"
        :href="documentFullUrlWithoutMetadata"
        :label="t('documentDownloadPopover.downloadWithoutMetadata')"
        variant="outline-action"
        class="document-download-popover__body__button"
        download
      />
      <button-icon
        :icon-left="IPhDownloadSimple"
        :label="t('documentDownloadPopover.downloadExtractText')"
        variant="outline-action"
        class="document-download-popover__body__button"
        @click="downloadTextContent"
      />
      <button-icon
        v-if="hasRoot"
        :icon-left="IPhDownloadSimple"
        :href="rootDocumentFullUrl"
        :label="t('documentDownloadPopover.downloadRoot')"
        variant="outline-action"
        class="document-download-popover__body__button"
        download
      />
      <div class="document-download-popover__body__sections">
        <document-download-popover-section
          :title="t('documentDownloadPopover.sectionTitle')"
          :value="document.title"
        />
        <document-download-popover-section :title="t('documentDownloadPopover.sectionContentType')">
          <app-icon
            :name="document.contentTypeIcon"
            class="me-2"
          />
          <display-content-type :value="document.contentType" />
        </document-download-popover-section>
        <document-download-popover-section v-if="executionWarning">
          <dismissable-alert
            class="m-0"
            no-close
            no-button
            bordered
            icon-class="align-self-start"
            variant="warning"
          >
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
  <!-- Render target independently when popover not yet mounted -->
  <span
    v-else
    @click="activate"
  >
    <slot name="target" />
  </span>
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
