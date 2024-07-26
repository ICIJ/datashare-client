<template>
  <b-button-group class="document-user-actions">
    <document-user-actions-entry
      v-for="action in actionsDisplayed"
      :key="action.name"
      :hide-label="hideLabels"
      :icon="action.icon"
      :label="action.label"
      :value="action.value"
    />
  </b-button-group>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import DocumentUserActionsEntry from '@/components/Document/DocumentUserActions/DocumentUserActionsEntry'
defineOptions({ name: 'DocumentUserActions' })
const props = defineProps({
  showTags: {
    type: Boolean,
    default: true
  },
  showComments: {
    type: Boolean,
    default: false
  },
  showRecommended: {
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
  hideLabels: {
    type: Boolean,
    default: false
  },
  tags: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  recommended: {
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
  }
})
const { t } = useI18n()
const actions = [
  {
    name: 'tags',
    show: props.showTags,
    label: t('documentUserActions.tags'),
    value: props.tags.toString(),
    icon: 'tag'
  },
  {
    name: 'comments',
    show: props.showComments,
    label: t('documentUserActions.comments'),
    value: props.comments.toString(),
    icon: 'chats-teardrop'
  },
  {
    name: 'recommended',
    show: props.showRecommended,
    label: t('documentUserActions.recommended'),
    value: props.recommended.toString(),
    icon: 'user-gear'
  },
  {
    name: 'folders',
    show: props.showFolders,
    label: t('documentUserActions.folders'),
    value: props.folders.toString(),
    icon: 'folder'
  },
  {
    name: 'notes',
    show: props.showNotes,
    label: t('documentUserActions.notes'),
    value: props.notes.toString(),
    icon: 'note-blank'
  }
]
const actionsDisplayed = computed(() => {
  return actions.filter((action) => action.show === true)
})
</script>
