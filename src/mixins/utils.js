const utils = {
  computed: {
    isServer () {
      return this.$config && this.$config.get('mode') === 'SERVER'
    }
  },
  methods: {
    refreshRoute () {
      this.$router.push({
        name: 'search',
        query: this.$store.getters['search/toRouteQuery']
      })
    }
  }
}

export default utils
