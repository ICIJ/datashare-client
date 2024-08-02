<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import DocumentUserActionsCard from '@/components/Document/DocumentUserActions/DocumentUserActionsCard'
import DisplayTags from '@/components/Display/DisplayTags'
import DocumentUserTagsAction from '@/components/Document/DocumentUserActions/DocumentUserTags/DocumentUserTagsAction'

defineOptions({ name: 'DocumentUserTags' })

const modelValue = defineModel({ type: String, required: true })
const props = defineProps({
  tags: {
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

const nbTags = computed(() => {
  return props.tags.length + props.othersTags.length
})

const title = computed(() => t('documentUserActions.tags', nbTags.value))
const tagListOthers = t('documentUserTags.tagListOthers')
const tagListYours = t('documentUserTags.tagListYours')
const tagWarning = t('documentUserTags.tagWarning')
const noTags = t('documentUserTags.noTags')
const tagIcon = 'tag'
</script>

<template>
  <document-user-actions-card
    :icon="tagIcon"
    :title="title"
    :is-split="isServer"
    :show-warning="isServer"
    :list-name-others="tagListOthers"
    :list-name-yours="tagListYours"
  >
    <template #others>
      <display-tags v-if="othersTags.length" :value="othersTags" />
      <span v-else>{{ noTags }}</span>
    </template>
    <template #yours>
      <display-tags v-if="tags.length" :value="tags" />
      <span v-else>{{ noTags }}</span>
    </template>
    <template #footer-warning>{{ tagWarning }}</template>
    <template #footer>
      <document-user-tags-action v-model="modelValue" class="d-inline-flex" />
    </template>
  </document-user-actions-card>
</template>
