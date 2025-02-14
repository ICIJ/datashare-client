<template>
  <div v-if="notes.length" class="m-3">
    <b-alert v-for="note in notes" :key="note.note" :variant="note.variant || 'warning'" show>
      {{ note.note }}
    </b-alert>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'

import { useDocumentNotes } from '@/store/modules/documentNotes'

const props = defineProps({ path: String })
const notes = ref([])
const store = useStore()
const documentNotesStore = useDocumentNotes()

onBeforeMount(async () => {
  const project = store.state.search.index
  const path = props.path
  notes.value = await documentNotesStore.fetchNotesByPath({ project, path })
})
</script>
