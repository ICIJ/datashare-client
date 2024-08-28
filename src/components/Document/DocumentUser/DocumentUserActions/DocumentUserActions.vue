<template>
  <form-actions
    compact-auto
    :compact="compact"
    dropdown-icon="dots-three-vertical"
    variant="action"
    compact-variant="outline-action"
    class="document-user-actions d-inline-flex justify-content-start bg-action-subtle flex-grow-0 rounded-1"
  >
    <document-user-actions-entry v-for="action in actionsDisplayed" :key="action.name" v-bind="action" class="m-1" />
  </form-actions>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { capitalize } from 'lodash'

import FormActions from '@/components/Form/FormActions/FormActions'
import DocumentUserActionsEntry from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'

defineOptions({ name: 'DocumentUserActions' })

const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  hideTooltips: {
    type: Boolean,
    default: false
  },
  shorterLabels: {
    type: Boolean,
    default: false
  },
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
const actions = computed(() => {
  return Object.values(USER_ACTIONS).map((action) => ({
    name: action,
    show: props[`show${capitalize(action)}`],
    icon: icons[action],
    label: t(`documentUserActions.${action}`, { n: props[action] }),
    value: props[action].toString(),
    hideTooltip: props.hideTooltips,
    hideLabel: props.hideLabels,
    shorter: props.shorterLabels,
    dropdownItem: props.compact
  }))
})
const actionsDisplayed = computed(() => {
  return actions.value.filter((action) => action.show === true)
})
</script>
<style lang="scss">
.document-user-actions {
  /*  & > .btn.dropdown-toggle,
  & .btn.show {
    border: 0;
    color: inherit;
    background: inherit;
    &:hover {
      background: var(--bs-btn-hover-bg);
      color: var(--bs-btn-hover-color);
    }
  }

  & .dropdown-menu {
    color: inherit;
    background: inherit;
    border-color: var(--bs-action-color);
    --bs-dropdown-min-width: null;
  }*/
  & .form-actions-compact-dropdown__toggle {
    background: var(--bs-btn-action-bg);
    color: var(--bs-btn-action-text);
    border: 0;
  }
}
</style>
