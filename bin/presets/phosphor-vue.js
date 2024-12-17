import keys from 'lodash/keys'
import * as icons from '@phosphor-icons/vue'

export function PhosphorVuePreset() {
  const nameMatch = (name) => name.match(/^Ph[A-Z]/)

  return {
    '@phosphor-icons/vue': keys(icons).filter(nameMatch)
  }
}
