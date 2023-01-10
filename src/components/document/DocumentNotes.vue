<template>
  <div v-if="notes.length" class="m-3">
    <b-alert v-for="note in notes" :key="note.note" :variant="note.variant || 'warning'" show>
      {{ note.note }}
    </b-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex'

/**
 * A list of notes related to a document's path and provided by the backend
 */
export default {
  name: 'DocumentNotes',
  props: {
    /**
     * Path to the document
     */
    path: {
      type: String
    }
  },
  data() {
    return {
      notes: []
    }
  },
  computed: {
    ...mapState('search', ['index'])
  },
  mounted() {
    this.retrieveNotes(this.index, this.path)
  },
  methods: {
    async retrieveNotes(project, path) {
      const notes = await this.$store.dispatch('documentNotes/retrieveNotes', { project, path })
      this.$set(this, 'notes', notes)
    }
  }
}
</script>
