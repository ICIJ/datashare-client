import shortkeys from '@/utils/shortkeys.json'
import { getShortkeyOS } from '@/utils/utils'
import isFunction from 'lodash/isFunction'

export default {
  methods: {
    getShortkey (name) {
      return shortkeys[this.$options.name][name]
    },
    getKeys (name) {
      const shortkey = this.getShortkey(name)
      return shortkey === undefined ? undefined : shortkey.keys[getShortkeyOS()]
    },
    getAction (name) {
      const shortkey = this.getShortkey(name)
      const functionName = shortkey.action
      if (isFunction(this[functionName])) {
        this[functionName](typeof event !== 'undefined' ? event : null)
      } else {
        throw new Error(`This function name "${functionName}" does not exist.`)
      }
    }
  }
}
