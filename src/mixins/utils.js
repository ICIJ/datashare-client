const utils = {
  computed: {
    isRemote () {
      return this.config && this.config.mode === 'SERVER'
    }
  }
}

export default utils
