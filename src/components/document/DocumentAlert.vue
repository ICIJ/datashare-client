<template>
  <div class="m-3" v-if="!!message">
    <b-alert :variant="variant" show>{{ message }}</b-alert>
  </div>
</template>

<script>
import DatashareClient from '@/api/DatashareClient'

const datashare = new DatashareClient()

export default {
  name: 'DocumentNote',
  data () {
    return {
      message: null,
      variant: 'warning'
    }
  },
  methods: {
    retrieveAlert (path) {
      const alert = datashare.retrieveAlert(path)
      this.message = alert.message
      this.variant = alert.variant
    }
  },
  mounted () {
    this.retrieveAlert(this.$route.path)
  }
}
</script>
