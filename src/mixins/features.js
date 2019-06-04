export default {
  methods: {
    hasFeature (name) {
      return [0, '0', 'false'].indexOf(process.env[`VUE_APP_FEATURE_${name.toUpperCase()}`]) === -1
    }
  }
}
