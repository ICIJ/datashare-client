<template>
  <b-button-group class="document-user-actions">
    <document-user-actions-entry
      v-for="action in actionsDisplayed"
      :key="action.name"
      :hide-tooltip-label="hideLabels"
      :icon="action.icon"
      :label="action.tooltipLabel"
      :value="action.value"
    />
  </b-button-group>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { capitalize } from 'lodash'

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
const USER_ACTIONS = {
  TAGS: 'tags',
  COMMENTS: 'comments',
  RECOMMENDED: 'recommended',
  FOLDERS: 'folders',
  NOTES: 'notes'
}
const icons = {
  [USER_ACTIONS.TAGS]: 'tag',
  [USER_ACTIONS.COMMENTS]: 'chats-teardrop',
  [USER_ACTIONS.RECOMMENDED]: 'user-gear',
  [USER_ACTIONS.FOLDERS]: 'folder',
  [USER_ACTIONS.NOTES]: 'note-blank'
}
const actions = Object.values(USER_ACTIONS).map((action) => ({
  name: action,
  show: props[`show${capitalize(action)}`],
  icon: icons[action],
  tooltipLabel: t(`documentUserActions.${action}`, { [action]: props[action] }),
  value: props[action].toString()
}))
const actionsDisplayed = computed(() => {
  return actions.filter((action) => action.show === true)
})
</script>
