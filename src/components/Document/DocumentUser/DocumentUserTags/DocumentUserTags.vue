<script setup>
import { computed } from 'vue'
import { matchesProperty, negate, property } from 'lodash'
import { useI18n } from 'vue-i18n'

import IPhHash from '~icons/ph/hash'

import { useMode } from '@/composables/useMode'
import ButtonTag from '@/components/Button/ButtonTag'
import DocumentUserActionsCard from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCard'
import DocumentUserTagsAction from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTagsAction'

defineOptions({ name: 'DocumentUserTags' })

const { tags, allTags, username } = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  allTags: {
    type: Array,
    default: () => []
  },
  username: {
    type: String
  }
})

const emit = defineEmits(['delete', 'add'])
const { t } = useI18n()
const { isServer } = useMode()
const matchesUsername = computed(() => matchesProperty('user.id', username))
const yourTags = computed(() => tags.filter(matchesUsername.value))
const othersTags = computed(() => tags.filter(negate(matchesUsername.value)))
const yourTagsLabels = computed(() => yourTags.value.map(property('label')))

const onActionUpdate = (newLabels) => {
  // Compare against the current user's own tags only to avoid emitting delete for other users' tags.
  const added = newLabels.filter(l => !yourTagsLabels.value.some(t => t.toLowerCase() === l.toLowerCase()))
  const removed = yourTagsLabels.value.filter(l => !newLabels.some(t => t.toLowerCase() === l.toLowerCase()))
  if (added.length) emit('add', added)
  removed.forEach(l => emit('delete', l))
}
const allTagsLabels = computed(() => allTags.map(property('label')))
const count = computed(() => tags.length)
</script>

<template>
  <document-user-actions-card
    action-start
    :icon="IPhHash"
    :title="t('documentUserActions.tags', count)"
    :is-split="isServer"
    :show-warning="isServer"
    :list-name-others="t('documentUserTags.tagListOthers')"
    list-body-class-others="d-flex flex-row flex-wrap gap-2"
    :list-name-yours="t('documentUserTags.tagListYours')"
    list-body-class-yours="d-flex flex-row flex-wrap gap-2"
  >
    <template #yours>
      <button-tag
        v-for="{ label } in yourTags"
        :key="label"
        :label="label"
        @delete="emit('delete', label)"
      />
    </template>
    <template #others>
      <button-tag
        v-for="{ label } in othersTags"
        :key="label"
        :label="label"
      />
    </template>
    <template #action-warning>
      {{ t('documentUserTags.tagWarning') }}
    </template>
    <template #action>
      <document-user-tags-action
        :model-value="yourTagsLabels"
        :options="allTagsLabels"
        class="d-inline-flex"
        @update:model-value="onActionUpdate($event)"
      />
    </template>
  </document-user-actions-card>
</template>
