<template>
  <b-button-group class="document-user-actions">
    <document-user-actions-entry v-if="showTags" :hide-label="hideLabels" icon="tag" label="Tags" value="3+" />
    <document-user-actions-entry
      v-if="showComments"
      :hide-label="hideLabels"
      icon="chats-teardrop"
      label="Comments"
      value="3+"
    />
    <document-user-actions-entry
      v-if="showRecommended"
      :hide-label="hideLabels"
      icon="user-gear"
      label="Recommended by"
      value="3+"
    />
    <document-user-actions-entry v-if="showFolders" :hide-label="hideLabels" icon="folder" label="Folder" value="3+" />
    <document-user-actions-entry v-if="showNotes" :hide-label="hideLabels" icon="note-blank" label="Notes" value="3+" />
  </b-button-group>
</template>
<script setup>
import DocumentUserActionsEntry from '@/components/Document/DocumentUserActions/DocumentUserActionsEntry'
defineOptions({ name: 'DocumentUserActions' })
defineProps({
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
  }
})
</script>
