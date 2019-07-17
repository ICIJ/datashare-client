export default {
  methods: {
    hasFeature (name) {
      const key = `VUE_APP_FEATURE_${name.toUpperCase()}`
      return key in process.env && [0, '0', 'false'].indexOf(process.env[key]) === -1
    }
  }
}
