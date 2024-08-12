<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { uniq } from 'lodash'

import DocumentUserActionsCard from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsCard'
import DocumentUserTagsAction from '@/components/Document/DocumentUser/DocumentUserTags/DocumentUserTagsAction'
import DisplayTagsSearchParameter from '@/components/Display/DisplayTagsSearchParameter'

defineOptions({ name: 'DocumentUserTags' })

const tags = defineModel({ type: Array, required: true, default: () => [] })
const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  username: {
    type: String
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
  return tags.value.length
})

const removeTag = (tagName) => {
  tags.value = tags.value.filter((currentTag) => currentTag.tag !== tagName)
}
const yoursTags = computed(() => {
  return tags.value.filter((currentTag) => currentTag.username === props.username).map((t) => t.tag)
})
const othersTags = computed(() => {
  return tags.value.filter((currentTag) => currentTag.username !== props.username).map((t) => t.tag)
})

const tagList = computed(() => {
  return tags.value.map((t) => t.tag)
})
const onNewTag = (tagListArray) => {
  const last = tagListArray.pop() // CD: Assume that we only add tag through the tag action input
  tags.value = [...tags.value, { tag: last, username: props.username }]
}
// TODO CD: not sure this should be handle inside the component
const uniqueOptions = computed(() => {
  return uniq([...tagList.value, ...props.options])
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
      <display-tags-search-parameter v-if="yoursTags.length" :value="yoursTags" @remove-value="removeTag" />
      <span v-else>{{ noTags }}</span>
    </template>
    <template #others>
      <display-tags-search-parameter v-if="othersTags.length" :value="othersTags" @remove-value="removeTag" />
      <span v-else>{{ noTags }}</span>
    </template>
    <template #action-warning>{{ tagWarning }}</template>
    <template #action>
      <document-user-tags-action
        :model-value="tagList"
        class="d-inline-flex"
        :options="uniqueOptions"
        @update:model-value="onNewTag"
      />
    </template>
  </document-user-actions-card>
</template>
