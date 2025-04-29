import { nameMatch } from '../icons'

export function PhosphorVueResolver() {
  return (name) => {
    if (nameMatch(name)) {
      return { name, from: '@phosphor-icons/vue' }
    }
  }
}
