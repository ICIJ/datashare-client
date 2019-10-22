import camelCase from 'lodash/camelCase'

export default {
  methods: {
    hasFeature (name) {
      const value = this.getConfigFeatureValue(name)
      return [0, '0', 'false', null, undefined].indexOf(value) === -1
    },
    getConfigFeatureValue (name) {
      return this.getConfigFeatureValueFromEnv(name) || this.getConfigFeatureValueFromConfig(name)
    },
    getConfigFeatureValueFromEnv (name) {
      const key = `VUE_APP_FEATURE_${name.toUpperCase()}`
      return process.env[key] || null
    },
    getConfigFeatureValueFromConfig (name) {
      const key = camelCase(`VUE_APP_FEATURE_${name.toUpperCase()}`)
      return this.$config ? this.$config.get(key, null) : null
    }
  }
}
