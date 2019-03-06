const utils = {
  computed: {
    isRemote () {
      return this.$config && this.$config.get('mode') === 'SERVER'
    }
  }
}

export default utils
