<template>
  <div class="document">
    {{ document }}
  </div>
</template>

<script>
import client from '@/api/client'

export default {
  name: 'Document',
  props: ['_id'],
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
    client.getDoc(to.params._id, (error, document) => {
      this.setDoc(error, document)
      next()
    })
  },
  beforeRouteEnter (to, from, next) {
    client.getDoc(to.params._id, (error, document) => {
      // Return false if the document is not found, else, assign the document
      next(error || !document.found ? false : vm => { vm.setDoc(error, document) })
    })
  }
}
</script>
