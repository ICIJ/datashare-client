<template>
  <div class="document-user-actions bg-action-subtle p-1 rounded-1">
    <form-actions
      ref="element"
      variant="action"
      :compact="compact"
      compact-variant="outline-action"
      class="d-flex justify-content-between flex-nowrap gap-1"
    >
      <div class="document-user-actions__start d-inline-flex gap-1 flex-nowrap">
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
      </div>
      <div class="document-user-actions__end d-inline-flex gap-1 flex-nowrap">
        <mode-local-only>
          <app-dropdown toggle-class="border-0">
            <document-dropdown-reindex />
          </app-dropdown>
        </mode-local-only>
        <slot
          name="end"
          v-bind="{ shorterLabels }"
        />
        <hook
          name="document-user-actions:after"
          :bind="{ shorterLabels }"
        />
      </div>
    </form-actions>
    <slot />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import { DOCUMENT_USER_ACTIONS } from '@/enums/documentUserActions'
import AppDropdown from '@/components/AppDropdown/AppDropdown'
import DocumentDropdownReindex from '@/components/Document/DocumentDropdown/DocumentDropdownReindex'
import DocumentUserActionsEntry from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'
import FormActions from '@/components/Form/FormActions/FormActions'
import Hook from '@/components/Hook/Hook'
import ModeLocalOnly from '@/components/Mode/ModeLocalOnly'

defineOptions({ name: 'DocumentUserActions' })

defineProps({
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
  compact: {
    type: Boolean,
    default: false
  },
  shorterLabels: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const emit = defineEmits(['action'])
</script>

<style lang="scss" scoped>
.document-user-actions {
  &:deep(.form-actions-compact-dropdown__toggle) {
    --bs-btn-bg: var(--bs-btn-action-bg);
    --bs-btn-color: var(--bs-btn-action-text);
    --bs-btn-border-color: transparent;
  }

  &__end{
    flex: 0 1 100%;
    justify-content: end;

  }
}
</style>
