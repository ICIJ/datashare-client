import Vue from 'vue'

export const EventBus = new Vue()

export function dispatch(name, detail = {}) {
  const event = new CustomEvent(`datashare:${name}`, { detail })
  return document.dispatchEvent(event)
}
