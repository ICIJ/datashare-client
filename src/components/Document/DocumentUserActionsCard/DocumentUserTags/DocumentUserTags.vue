<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { uniq } from 'lodash'

import DocumentUserActionsCard from '@/components/Document/DocumentUserActionsCard/DocumentUserActionsCard'
import DocumentUserTagsAction from '@/components/Document/DocumentUserActionsCard/DocumentUserTags/DocumentUserTagsAction'
import DisplayTagsSearchParameter from '@/components/Display/DisplayTagsSearchParameter'

defineOptions({ name: 'DocumentUserTags' })

const tags = defineModel({ type: Array, required: true, default: () => [] })
const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  othersTags: {
    type: Array,
    default: () => []
  },
  isServer: { type: Boolean, default: false }
})

const { t } = useI18n()

const title = computed(() => t('documentUserActions.tags', nbTags.value))
const tagListOthers = t('documentUserTags.tagListOthers')
const tagListYours = t('documentUserTags.tagListYours')
const tagWarning = t('documentUserTags.tagWarning')
const noTags = t('documentUserTags.noTags')
const tagIcon = 'tag'

const nbTags = computed(() => {
  return tags.value.length + props.othersTags.length
})

function removeTag(tag) {
  tags.value = tags.value.filter((currentTag) => currentTag !== tag)
}

// TODO CD: not sure this should be handle inside the component
const uniqueOptions = computed(() => {
  return uniq([...tags.value, ...props.options, ...props.othersTags])
})
</script>

<template>
  <document-user-actions-card
    action-start
    :icon="tagIcon"
    :title="title"
    :is-split="isServer"
    :show-warning="isServer"
    :list-name-others="tagListOthers"
    :list-name-yours="tagListYours"
  >
    <template #yours>
      <display-tags-search-parameter v-if="tags.length" :value="tags" @remove-tag="removeTag" />
      <span v-else>{{ noTags }}</span>
    </template>
    <template #others>
      <display-tags-search-parameter v-if="othersTags.length" :value="othersTags" no-x-icon />
      <span v-else>{{ noTags }}</span>
    </template>
    <template #action-warning>{{ tagWarning }}</template>
    <template #action>
      <document-user-tags-action v-model="tags" class="d-inline-flex" :options="uniqueOptions" />
    </template>
  </document-user-actions-card>
</template>
