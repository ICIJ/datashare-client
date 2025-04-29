import mitt from 'mitt'

export const EventBus = mitt()

export function dispatch(name, detail = {}) {
  const event = new CustomEvent(`datashare:${name}`, { detail })
  return document.dispatchEvent(event)
}
