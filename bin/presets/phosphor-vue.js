import { property } from 'lodash'
import * as icons from '@phosphor-icons/vue'

export function PhosphorVuePreset() {
  const nameMatch = (name) => name.match(/^Ph[A-Z]/)

  return {
    '@phosphor-icons/vue': icons.map(property('name')).filter(nameMatch)
  }
}
