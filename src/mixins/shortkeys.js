import shortkeys from '@/utils/shortkeys.json'
import { getOS } from '@/utils/utils'

export default {
  methods: {
    getKeys (name) {
      const os = getOS() === 'mac' ? 'mac' : 'default'
      return shortkeys[this.$options.name][name].keys[os]
    },
    getAction (name) {
      this[shortkeys[this.$options.name][name]['action']]()
    }
  }
}
