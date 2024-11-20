export function PhosphorVueResolver() {
  return (name) => {
    if (name.match(/^Ph[A-Z]/)) {
      return { name, from: '@phosphor-icons/vue' }
    }
  }
}
