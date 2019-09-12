import shortkeys from '@/utils/shortkeys.json'
import { getOS } from '@/utils/utils'
import isFunction from 'lodash/isFunction'

export default {
  methods: {
    getKeys (name) {
      const os = getOS() === 'mac' ? 'mac' : 'default'
      return shortkeys[this.$options.name][name].keys[os]
    },
    getAction (name) {
      const functionName = shortkeys[this.$options.name][name].action
      if (isFunction(this[functionName])) {
        this[functionName](typeof event !== 'undefined' ? event : null)
      } else {
        throw new Error(`This function name "${functionName}" does not exist.`)
      }
    }
  }
}
