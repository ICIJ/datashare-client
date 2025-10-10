<template>
  <div
    v-if="notes.length"
    class="mt-3"
  >
    <b-alert
      v-for="note in notes"
      :key="note.note"
      class="m-0"
      :variant="note.variant || 'warning'"
      show
    >
      {{ note.note }}
    </b-alert>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'

import { useDocumentNotesStore, useDocumentStore } from '@/store/modules'

const props = defineProps({ path: String })
const notes = ref([])
const documentStore = useDocumentStore()
const documentNotesStore = useDocumentNotesStore()

onBeforeMount(async () => {
  const { project } = documentStore.document
  const path = props.path
  notes.value = await documentNotesStore.fetchNotesByPath({ project, path })
})
</script>
