<template>
  <div class="m-3" v-if="notes.length">
    <b-alert v-for="note in notes" :key="note.note" :variant="note.variant || 'warning'" show>
      {{ note.note }}
    </b-alert>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import DatashareClient from '@/api/DatashareClient'

const datashare = new DatashareClient()

export default {
  name: 'DocumentNote',
  props: {
    path: String
  },
  data () {
    return {
      notes: []
    }
  },
  computed: {
    ...mapState('search', ['index'])
  },
  methods: {
    async retrieveNotes (project, path) {
      this.notes = await datashare.retrieveNotes(project, path)
    }
  },
  mounted () {
    this.retrieveNotes(this.index, this.path)
  }
}
</script>
