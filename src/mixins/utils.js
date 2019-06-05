const utils = {
  data () {
    return {
      termIndexColors: [
        '#ECFC7A',
        '#CDFD94',
        '#A8FDAC',
        '#52FDEA'
      ]
    }
  },
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
    },
    getTermIndexColor (index) {
      return this.termIndexColors[index % this.termIndexColors.length]
    },
    getTermIndexBorderColor (index) {
      return { 'border-color': this.getTermIndexColor(index) }
    },
    getTermIndexBackgroundColor (index) {
      return { 'background-color': this.getTermIndexColor(index) }
    }
  }
}

export default utils
