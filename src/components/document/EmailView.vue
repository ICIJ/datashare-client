<template>
  <div class="email-view">
    <pre>{{ thread }}</pre>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'EmailView',
  props: ['id', 'routing'],
  data () {
    return {
      thread: []
    }
  },
  computed: {
    ...mapState('document', {
      document: 'doc'
    })
  },
  methods: {
    async getThread (params = { id: this.id, routing: this.routing }) {
      await this.$store.dispatch('document/get', params)
      this.thread = await this.$store.dispatch('document/getThread')
      await this.$store.commit('userHistory/addDocument', this.document)
    }
  },
  beforeRouteEnter (to, _from, next) {
    next(vm => vm.getThread(to.params))
  },
  beforeRouteUpdate (to, _from, next) {
    this.getThread(to.params)
    next()
  }
}
</script>

<style lang="scss">
  .email-view {
    overflow: hidden;
    background: white;
    min-height: 90vh;
    margin: 0;
  }
</style>
