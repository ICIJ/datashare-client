<script setup>
import { computed } from 'vue'
import { matchesProperty, negate, property } from 'lodash'
import { useI18n } from 'vue-i18n'

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
const tagsLabels = computed(() => tags.map(property('label')))
const allTagsLabels = computed(() => allTags.map(property('label')))
const matchesUsername = computed(() => matchesProperty('user.id', username))
const yourTags = computed(() => tags.filter(matchesUsername.value))
const othersTags = computed(() => tags.filter(negate(matchesUsername.value)))
const count = computed(() => tags.length)
</script>

<template>
  <document-user-actions-card
    action-start
    icon="hash"
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
        @delete="emit('delete', label)"
      />
    </template>
    <template #action-warning>
      {{ t('documentUserTags.tagWarning') }}
    </template>
    <template #action>
      <document-user-tags-action
        :model-value="tagsLabels"
        :options="allTagsLabels"
        class="d-inline-flex"
        @update:model-value="emit('add', $event)"
      />
    </template>
  </document-user-actions-card>
</template>
