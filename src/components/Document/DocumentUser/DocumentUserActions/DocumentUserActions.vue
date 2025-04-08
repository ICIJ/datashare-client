<template>
  <form-actions
    ref="element"
    end
    compact-auto
    :compact-auto-breakpoint="compactAutoBreakpoint"
    dropdown-icon="dots-three-vertical"
    variant="action"
    compact-variant="outline-action"
    class="document-user-actions d-inline-flex justify-content-start bg-action-subtle flex-grow-0 rounded-1"
  >
    <hook name="document-user-actions:before" />
    <document-user-actions-entry
      v-for="action in visibleActions"
      :key="action.name"
      v-bind="action"
      class="m-1"
      @click="emit('action', action)"
    />
    <hook name="document-user-actions:after" />
  </form-actions>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, toRef, useTemplateRef } from 'vue'
import { capitalize, property } from 'lodash'

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
  showComments: {
    type: Boolean,
    default: false
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
  tags: {
    type: Number,
    default: 0
  },
  comments: {
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

const elementRef = useTemplateRef('element')
// We short labels based on the width of the element.
const { compact: shorterLabels } = useCompact(elementRef, { threshold: toRef(props, 'shorterLabelsThreshold') })

const emit = defineEmits(['action'])
const { t } = useI18n()

const USER_ACTIONS = {
  TAGS: 'tags',
  COMMENTS: 'comments',
  RECOMMENDATIONS: 'recommendations',
  FOLDERS: 'folders',
  NOTES: 'notes'
}

const icons = {
  [USER_ACTIONS.TAGS]: 'hash',
  [USER_ACTIONS.COMMENTS]: 'chats-teardrop',
  [USER_ACTIONS.RECOMMENDATIONS]: ['eyes', 'fill'],
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
    hideTooltip: !shorterLabels.value,
    shorterLabel: shorterLabels.value
  }))
})

const visibleActions = computed(() => actions.value.filter(property('show')))
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
