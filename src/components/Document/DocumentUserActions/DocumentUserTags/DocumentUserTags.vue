<script setup>
import DocumentUserActionsCard from '@/components/Document/DocumentUserActions/DocumentUserActionsCard'
import DisplayTags from '@/components/Display/DisplayTags'
import DocumentUserTagsAction from '@/components/Document/DocumentUserActions/DocumentUserTags/DocumentUserTagsAction'
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

const nbTags = props.tags.length + props.othersTags.length
const title = `${nbTags} tags`
const tagListOthers = 'Added by others'
const tagListYours = 'Added by you'
const tagWarning = 'Your tags are public to project members'
const noTags = 'No tags added yet.'
</script>

<template>
  <document-user-actions-card
    icon="tag"
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
