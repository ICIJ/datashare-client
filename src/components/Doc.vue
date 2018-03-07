<template>
  <div class="doc">
    {{ doc }}
  </div>
</template>

<script>
import client from '@/api/client'

export default {
  name: 'Doc',
  props: ['_id'],
  data () {
    return {
      doc: null
    }
  },
  methods: {
    setDoc (err, doc) {
      if (!err) {
        this.$set(this, 'doc', doc)
      }
    }
  },
  beforeRouteUpdate (to, from, next) {
    client.getDoc(to.params._id, (error, doc) => {
      this.setDoc(error, doc)
      next()
    })
  },
  beforeRouteEnter (to, from, next) {
    client.getDoc(to.params._id, (error, doc) => {
      // Return false if the doc is not found, else, assign the doc
      next(error || !doc.found ? false : vm => { vm.setDoc(error, doc) })
    })
  }
}
</script>
