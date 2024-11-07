<template>
  <div ref="element" class="document-user-actions">
    <form-actions
      end
      compact-auto
      :compact-auto-breakpoint="compactAutoBreakpoint"
      dropdown-icon="dots-three-vertical"
      variant="action"
      compact-variant="outline-action"
      class="d-inline-flex justify-content-start bg-action-subtle flex-grow-0 rounded-1"
    >
      <document-user-actions-entry v-for="action in visibleActions" :key="action.name" v-bind="action" class="m-1" />
    </form-actions>
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { computed, toRef, useTemplateRef } from 'vue'
import { capitalize, property } from 'lodash'

import FormActions from '@/components/Form/FormActions/FormActions'
import DocumentUserActionsEntry from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'
import { useCompact } from '@/composables/compact'
import { SIZE } from '@/enums/sizes'

defineOptions({ name: 'DocumentUserActions' })

const props = defineProps({
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
  },
  compactAutoBreakpoint: {
    type: String,
    default: SIZE.SM
  },
  hideLabelsThreshold: {
    type: Number,
    default: 660
  }
})

const elementRef = useTemplateRef('element')
// We hide labels based on the width of the element.
const { compact: hideLabels } = useCompact(elementRef, { threshold: toRef(props, 'hideLabelsThreshold') })

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
    hideTooltip: !hideLabels.value,
    hideLabel: hideLabels.value,
    shorterLabel: props.shorterLabels
  }))
})

const visibleActions = computed(() => actions.value.filter(property('show')))
</script>

<style lang="scss" scoped>
.document-user-actions {
  width: 100%;

  &:deep(.form-actions-compact-dropdown__toggle) {
    --bs-btn-bg: var(--bs-btn-action-bg);
    --bs-btn-color: var(--bs-btn-action-text);
    --bs-btn-border-color: transparent;
  }
}
</style>
