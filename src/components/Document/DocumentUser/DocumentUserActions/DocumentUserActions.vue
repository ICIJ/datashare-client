<template>
  <div class="document-user-actions bg-action-subtle p-1 rounded-1 d-inline-block">
    <form-actions
      ref="element"
      end
      compact-auto
      :compact-auto-breakpoint="compactAutoBreakpoint"
      variant="action"
      compact-variant="outline-action"
      class="d-inline-flex justify-content-start flex-grow-0 gap-1"
    >
      <hook name="document-user-actions:before" />
      <document-user-actions-entry
        v-if="showTags"
        :active="activeTags"
        :label="t(`documentUserActions.tags`, { n: tags })"
        :value="String(tags)"
        :icon="PhHash"
        :hide-tooltip="!shorterLabels"
        :shorter-label="shorterLabels"
        @click="emit('action', DOCUMENT_USER_ACTIONS.TAGS)"
      />
      <document-user-actions-entry
        v-if="showRecommendations"
        :active="activeRecommendations"
        :label="t(`documentUserActions.recommendations`, { n: recommendations })"
        :value="String(recommendations)"
        :icon="[PhEyes, 'fill']"
        :hide-tooltip="!shorterLabels"
        :shorter-label="shorterLabels"
        @click="emit('action', DOCUMENT_USER_ACTIONS.RECOMMENDATIONS)"
      />
      <document-user-actions-entry
        v-if="showNotes"
        :active="activeNotes"
        :label="t(`documentUserActions.notes`, { n: notes })"
        :value="String(notes)"
        :icon="PhNoteBlank"
        :hide-tooltip="!shorterLabels"
        :shorter-label="shorterLabels"
        @click="emit('action', DOCUMENT_USER_ACTIONS.TAGS.NOTES)"
      />
      <document-user-actions-entry
        v-if="showFolders"
        :active="activeFolders"
        :label="t(`documentUserActions.folders`, { n: folders })"
        :value="String(folders)"
        :icon="PhFolder"
        :hide-tooltip="!shorterLabels"
        :shorter-label="shorterLabels"
        @click="emit('action', DOCUMENT_USER_ACTIONS.FOLDERS)"
      />
      <hook name="document-user-actions:after" :bind="{ shorterLabels }" />
    </form-actions>
  </div>
</template>

<script setup>
import { toRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { DOCUMENT_USER_ACTIONS } from '@/enums/documentUserActions'
import DocumentUserActionsEntry from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'
import FormActions from '@/components/Form/FormActions/FormActions'
import Hook from '@/components/Hook/Hook'
import { useCompact } from '@/composables/useCompact'
import { SIZE } from '@/enums/sizes'

defineOptions({ name: 'DocumentUserActions' })

const props = defineProps({
  showTags: {
    type: Boolean,
    default: true
  },
  showRecommendations: {
    type: Boolean,
    default: false
  },
  showFolders: {
    type: Boolean,
    default: false
  },
  showNotes: {
    type: Boolean,
    default: false
  },
  activeRecommendations: {
    type: Boolean,
    default: false
  },
  activeTags: {
    type: Boolean,
    default: false
  },
  activeFolders: {
    type: Boolean,
    default: false
  },
  activeNotes: {
    type: Boolean,
    default: false
  },
  tags: {
    type: Number,
    default: 0
  },
  recommendations: {
    type: Number,
    default: 0
  },
  folders: {
    type: Number,
    default: 0
  },
  notes: {
    type: Number,
    default: 0
  },
  compactAutoBreakpoint: {
    type: String,
    default: SIZE.SM
  },
  shorterLabelsThreshold: {
    type: Number,
    default: 660
  }
})
const { t } = useI18n()

const elementRef = useTemplateRef('element')
// We short labels based on the width of the element.
const { compact: shorterLabels } = useCompact(elementRef, { threshold: toRef(props, 'shorterLabelsThreshold') })

const emit = defineEmits(['action'])
</script>

<style lang="scss" scoped>
.document-user-actions {
  &:deep(.form-actions-compact-dropdown__toggle) {
    --bs-btn-bg: var(--bs-btn-action-bg);
    --bs-btn-color: var(--bs-btn-action-text);
    --bs-btn-border-color: transparent;
  }
}
</style>
