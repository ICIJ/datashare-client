import { has, get, invoke, clamp } from 'lodash'

const bindingHandlers = new WeakMap()

export const draggable = {
  updated(el, binding) {
    bindingHandlers.set(el, binding.value)
  },
  mounted(el, binding, vnode) {
    let startX, initialClientX
    const relative = binding.modifiers?.relative ?? false
    const percent = binding.modifiers?.percent ?? false
    bindingHandlers.set(el, binding.value)

    // Emit an event to the parent component
    function emitEvent({ name, detail = null }) {
      vnode.el?.dispatchEvent(new CustomEvent(name, { detail }))
      const handlers = get(vnode, 'data.on') ?? get(vnode, 'componentOptions.listeners')
      if (has(handlers, name)) {
        invoke(handlers, `${name}.fns`, detail)
      }
    }

    // Handle the dragging of the element
    function move(event) {
      const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
      const offset = binding.value.offset ?? relative ? el.offsetWidth : 0
      const target = bindingHandlers.get(el).target
      const max = target.parentNode.getBoundingClientRect().width
      const min = binding.value.min ?? 0
      const x = clamp(startX + clientX - initialClientX, min, max - offset)
      const detail = percent ? (x / max) * 100 : x
      emitEvent({ name: 'drag', detail })
      return false
    }

    // Clean up listeners once the dragging ends
    function end(event) {
      emitEvent({ name: 'dragend' })
      if (event instanceof MouseEvent) {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', end)
      } else {
        document.removeEventListener('touchmove', move)
        document.removeEventListener('touchend', end)
      }
    }

    // Register listeners when dragging start
    function start(event) {
      emitEvent({ name: 'dragstart' })
      startX = bindingHandlers.get(el).target.offsetLeft
      if (event instanceof MouseEvent) {
        initialClientX = event.clientX
        document.addEventListener('mousemove', move)
        document.addEventListener('mouseup', end)
      } else {
        initialClientX = event.touches[0].clientX
        document.addEventListener('touchmove', move)
        document.addEventListener('touchend', end)
      }
      return false
    }

    // Register the drag and touch event handlers
    el.addEventListener('mousedown', start)
    el.addEventListener('touchstart', start)
  }
}
