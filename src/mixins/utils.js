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
  methods: {
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
