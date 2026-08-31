<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur'

import AppDropdown from '@/components/AppDropdown/AppDropdown'
import { useScrollParent } from '@/composables/useScrollParent'

/**
 * Whether the extracted text is rendered as formatted markdown rather than plain text.
 */
const preferMarkdown = defineModel({ type: Boolean, default: true })

const props = defineProps({
  /**
   * The structure artifact exists but holds no markdown, so the formatted
   * rendering has nothing to show.
   */
  markdownDisabled: {
    type: Boolean,
    default: false
  },
  /**
   * A translation is displayed. Translations are only available as plain text,
   * so the choice is out of the user's hands until they go back to the original.
   */
  translation: {
    type: Boolean,
    default: false
  },
  /**
   * The formatted view exists but is very large: the reader fell back to
   * plain text and picking Formatted again will render it anyway, slowly.
   */
  markdownSlow: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

// A translation renders as plain text whatever the stored preference is, so the
// active entry must follow what the body actually shows rather than what the
// user picked on an earlier document.
const isMarkdownActive = computed(() => preferMarkdown.value && !props.translation)

const scrollParent = useScrollParent({ node: document.body })
</script>

<template>
  <app-dropdown
    :teleport-to="scrollParent"
    boundary="viewport"
    :aria-label="t('documentContent.view.ariaLabel')"
    class="document-content-dropdown"
  >
    <b-dropdown-text
      v-if="translation"
      text-class="document-content-dropdown__reason bg-warning-subtle text-warning-emphasis small mb-1 py-2"
    >
      {{ t('documentContent.view.translationTooltip') }}
    </b-dropdown-text>
    <b-dropdown-text
      v-else-if="markdownSlow"
      text-class="document-content-dropdown__reason bg-warning-subtle text-warning-emphasis small mb-1 py-2"
    >
      {{ t('documentContent.view.oversizedTooltip') }}
    </b-dropdown-text>
    <b-dropdown-item-button
      :active="isMarkdownActive"
      :disabled="markdownDisabled || translation"
      button-class="document-content-dropdown__markdown"
      @click="preferMarkdown = true"
    >
      <span class="d-flex align-items-center gap-2">
        <app-icon><i-ph-article /></app-icon>
        {{ t('documentContent.view.markdown') }}
      </span>
    </b-dropdown-item-button>
    <b-dropdown-item-button
      :active="!isMarkdownActive"
      :disabled="translation"
      button-class="document-content-dropdown__text"
      @click="preferMarkdown = false"
    >
      <span class="d-flex align-items-center gap-2">
        <app-icon><i-ph-text-align-left /></app-icon>
        {{ t('documentContent.view.text') }}
      </span>
    </b-dropdown-item-button>
  </app-dropdown>
</template>

<style lang="scss">
// The menu sizes itself to its widest child, so a one-line reason would
// stretch it to the sentence's full length: cap it and let the text wrap.
.document-content-dropdown__reason {
  max-width: 240px;
  white-space: normal;
}
</style>
