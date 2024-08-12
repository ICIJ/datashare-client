<template>
  <component
    :is="component"
    :class="classList"
    :items="actionsDisplayed"
    :compact="compact"
    :hide-tooltips="hideTooltips"
    :hide-labels="hideLabels"
  />
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { capitalize } from 'lodash'

import DocumentUserActionsDropdown from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsDropdown'
import DocumentUserActionsList from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsList'

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
  hideTooltips: {
    type: Boolean,
    default: false
  },
  hideLabels: {
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
    compact: props.compact
  }))
})
const actionsDisplayed = computed(() => {
  return actions.value.filter((action) => action.show === true)
})

const component = computed(() => {
  return props.dropdown ? DocumentUserActionsDropdown : DocumentUserActionsList
})
const classList = computed(() => {
  return 'text-action-emphasis'
})
</script>
<style lang="scss">
.document-user-actions {
  &--dropdown {
    & > .btn:first-child {
      border: 0;
      padding: 0;
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
