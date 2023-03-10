import isFunction from 'lodash/isFunction'

import shortkeys from '@/utils/shortkeys.json'
import { getShortkeyOS } from '@/utils/utils'

export default {
  props: {
    /**
     * Name of the scope for the shortkey settings.
     * @default Name of the current component
     */
    shortkeyScope: {
      type: String,
      default() {
        return this.$options.name
      }
    }
  },
  methods: {
    getShortkey(name) {
      return shortkeys[this.shortkeyScope][name]
    },
    getKeys(name) {
      const shortkey = this.getShortkey(name)
      return shortkey === undefined ? undefined : shortkey.keys[getShortkeyOS()]
    },
    getAction(name) {
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
