<template>
  <div class="document-notes d-flex flex-column gap-3">
    <b-alert
      v-for="({ note, variant }, i) in notes"
      :key="i"
      class="m-0"
      no-fade
      :variant="variant || 'warning'"
      show
    >
      {{ note }}
    </b-alert>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'

import { useDocumentNotesStore } from '@/store/modules'

const props = defineProps({ document: Object })
const notes = ref([])
const documentNotesStore = useDocumentNotesStore()

onBeforeMount(async () => {
  const { project, path } = props.document
  notes.value = await documentNotesStore.fetchNotesByPath({ project, path })
})
</script>
