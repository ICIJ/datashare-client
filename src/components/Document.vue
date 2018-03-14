<template>
  <div class="document container py-4" v-if="document">
    <h3>{{ document.basename }}</h3>
    <p class="text-muted">{{ document.source.path }}</p>
  </div>
</template>

<script>
import client from '@/api/client'

export default {
  name: 'Document',
  props: ['id'],
  data () {
    return {
      document: null
    }
  },
  methods: {
    setDoc (err, document) {
      if (!err) {
        this.$set(this, 'document', document)
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    client.getEsDoc(to.params.id, (error, document) => {
      this.setDoc(error, document)
      next()
    })
  },
  beforeRouteEnter (to, from, next) {
    client.getEsDoc(to.params.id, (error, document) => {
      // Return false if the document is not found, else, assign the document
      next(error ? false : vm => { vm.setDoc(null, document) })
    })
  }
}
</script>
