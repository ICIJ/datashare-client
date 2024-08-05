<template>
  <b-dropdown
    v-if="dropdown"
    split
    variant="outline-action"
    class="document-user-actions document-user-actions--dropdown text-action-emphasis bg-action-subtle p-0 m-2"
  >
    <template #button-content><document-user-actions-entry v-bind="tagAction" /></template>
    <document-user-actions-entry v-for="action in otherActions" :key="action.name" v-bind="action" dropdown-item />
  </b-dropdown>
  <b-button-group v-else class="document-user-actions justify-content-between text-action-emphasis bg-action-subtle">
    <document-user-actions-entry v-for="action in actionsDisplayed" :key="action.name" v-bind="action" />
  </b-button-group>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { capitalize } from 'lodash'

import DocumentUserActionsEntry from '@/components/Document/DocumentUserActions/DocumentUserActionsEntry'

defineOptions({ name: 'DocumentUserActions' })

const props = defineProps({
  dropdown: {
    type: Boolean,
    default: false
  },
  compact: {
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
  hideLabels: {
    type: Boolean,
    default: false
  },
  hideTooltips: {
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
  label: t(`documentUserActions.${action}`, { n: props[action] }),
  value: props[action].toString(),
  hideTooltip: props.hideTooltips,
  hideLabel: props.hideLabels,
  compact: props.compact
}))
const actionsDisplayed = computed(() => {
  return actions.filter((action) => action.show === true)
})
const tagAction = computed(() => {
  const tag = { ...actions[0] }
  const label = props.compact ? tag.value : tag.label
  tag.tag = 'span'
  tag.label = label
  tag.tooltipLabel = tag.label
  return tag
})
const otherActions = computed(() => {
  return actions.slice(1)
})
</script>
<style lang="scss">
.document-user-actions {
  &--dropdown {
    & > .btn:first-child {
      border: 0;
      padding: 0 0.5em 0 0;
      text-align: center;
      background: inherit;
      &:hover {
        color: unset;
        background: unset;
      }
    }

    & > .btn.dropdown-toggle {
      &::after {
        all: unset;
        content: '⋮';
      }
    }
  }

  & > .btn.dropdown-toggle,
  & > .btn.show {
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
  }
}
</style>
