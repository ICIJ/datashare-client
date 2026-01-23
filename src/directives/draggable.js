import { has, get, invoke, clamp } from 'lodash'

/**
 * WeakMap to store the binding values per-element.
 */
const bindingHandlers = new WeakMap()

/**
 * WeakMap to store the ResizeObserver instances per-element.
 */
const resizeObservers = new WeakMap()

/**
 * Emits a custom event on the vnode’s element and also calls any Vue listeners.
 *
 * @param {Object} vnode - The Vue vnode containing event listeners.
 * @param {string} name - The name of the event to emit.
 * @param {*} [detail=null] - The detail payload to pass along with the event.
 */
function emitEvent(vnode, name, detail = null) {
  // Dispatch a native browser event
  vnode.el?.dispatchEvent(new CustomEvent(name, { detail }))

  // Dispatch to any Vue listeners found on the vnode
  const handlers = get(vnode, 'data.on') || get(vnode, 'componentOptions.listeners')
  if (has(handlers, name)) {
    invoke(handlers, `${name}.fns`, detail)
  }
}

/**
 * Calculates the drag position, clamping between a min and (max - offset).
 * Optionally returns the position as a percentage.
 *
 * @param {Object} params
 * @param {number} params.startX - Initial offsetLeft of the draggable element.
 * @param {number} params.initialClientX - The X coordinate of the mouse/touch when drag started.
 * @param {number} params.clientX - Current X coordinate of the mouse/touch or element.
 * @param {Object} params.bindingValue - The binding value provided to the directive.
 * @param {number} params.elementWidth - The width of the draggable “handle” (used if relative mode).
 * @param {number} params.parentWidth - The width of the parent element.
 * @param {boolean} params.percent - Whether to convert the position into a percentage of parentWidth.
 * @returns {Object} - Computed drag metrics including `position`, `x`, `detail`, and thresholds.
 */
function calculateDragPosition({ startX, initialClientX, clientX, bindingValue, elementWidth, parentWidth, percent }) {
  // The offset is either the user-provided offset or
  // the element's own width if `relative` mode is active
  const offset = bindingValue.offset ?? elementWidth
  const minStart = bindingValue.minStart ?? 0
  const minEnd = bindingValue.minEnd ?? 0
  const position = startX + (clientX - initialClientX)
  const x = clamp(position, minStart, parentWidth - offset - minEnd)
  const detail = percent ? (x / parentWidth) * 100 : x
  const reduceThreshold = bindingValue.reduceThreshold ?? 100
  const expandThreshold = bindingValue.expandThreshold ?? 100

  return { position, x, detail, reduceThreshold, expandThreshold }
}

/**
 * Handles threshold logic during a drag event.
 * Emits "reduce", "expand", or "drag" depending on the position.
 *
 * @param {Object} params
 * @param {number} params.position - The raw position before clamping.
 * @param {number} params.x - The clamped position.
 * @param {number|float} params.detail - The final detail (px or percent).
 * @param {number} params.reduceThreshold - Distance threshold to trigger "reduce".
 * @param {number} params.expandThreshold - Distance threshold to trigger "expand".
 * @param {number} params.parentWidth - The total width of the draggable’s container.
 * @param {Function} params.emitCallback - Function to emit events.
 */
function handleDragThresholds({ position, x, detail, reduceThreshold, expandThreshold, parentWidth, emitCallback }) {
  if (x - position >= reduceThreshold) {
    emitCallback('reduce', detail)
  }
  else if (position >= parentWidth - expandThreshold) {
    emitCallback('expand', detail)
  }
  else {
    emitCallback('drag', detail)
  }
}

/**
 * Handles threshold logic during a resize event.
 * Only emits "reduce" or "expand" if thresholds are crossed.
 *
 * @param {Object} params
 * @param {number} params.position - The raw position before clamping.
 * @param {number|float} params.detail - The final detail (px or percent).
 * @param {number} params.expandThreshold - Distance threshold to trigger "expand".
 * @param {number} params.parentWidth - The total width of the draggable’s container.
 * @param {Function} params.emitCallback - Function to emit events.
 */
function handleResizeThresholds({ position, detail, expandThreshold, parentWidth, emitCallback }) {
  if (position >= parentWidth - expandThreshold) {
    emitCallback('expand', detail)
  }
}

export const draggable = {
  /**
   * Called when the bound element’s parent component updates or
   * when the directive’s value changes. Keeps the references fresh.
   */
  updated(el, binding) {
    bindingHandlers.set(el, binding.value)
    resizeObservers.get(el).observe(binding.value.target.parentNode)
  },

  /**
   * Optionally clean up when the element is unmounted (if desired).
   * Removes event listeners and disconnects the ResizeObserver.
   */
  unmounted(el) {
    const observer = resizeObservers.get(el)
    if (observer) {
      observer.disconnect()
      resizeObservers.delete(el)
    }

    bindingHandlers.delete(el)
  },

  /**
   * Called once when the directive is bound to the element.
   * Sets up listeners for dragging and for resize observation.
   */
  mounted(el, binding, vnode) {
    let startX = 0
    let initialClientX = 0

    // Check for modifiers
    const relative = binding.modifiers?.relative ?? false
    const percent = binding.modifiers?.percent ?? false

    // Store the current binding value in a WeakMap for future reference
    bindingHandlers.set(el, binding.value)

    /**
     * Starts the dragging process by:
     * - Emitting "dragstart"
     * - Storing initial positions
     * - Registering mouse/touch listeners for move/end
     */
    function startDrag(event) {
      emitEvent(vnode, 'dragstart')
      startX = bindingHandlers.get(el).target.offsetLeft

      if (event instanceof MouseEvent) {
        initialClientX = event.clientX
        document.addEventListener('mousemove', onDragMove)
        document.addEventListener('mouseup', onDragEnd)
      }
      else {
        initialClientX = event.touches[0].clientX
        document.addEventListener('touchmove', onDragMove)
        document.addEventListener('touchend', onDragEnd)
      }

      // Prevent default behavior (e.g. scrolling on touch devices)
      event.preventDefault()
    }

    /**
     * Continuously called during dragging.
     * Applies position clamping and threshold checks, then emits appropriate events.
     * Uses requestAnimationFrame to batch DOM reads and prevent layout thrashing.
     */
    function onDragMove(event) {
      const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX

      // Batch DOM reads in requestAnimationFrame to prevent layout thrashing
      requestAnimationFrame(() => {
        const bindingValue = bindingHandlers.get(el)
        const targetElement = bindingValue.target
        const parentWidth = targetElement.parentNode.getBoundingClientRect().width
        const elementWidth = relative ? el.offsetWidth : 0

        const { position, x, detail, reduceThreshold, expandThreshold } = calculateDragPosition({
          startX,
          initialClientX,
          clientX,
          bindingValue,
          elementWidth,
          parentWidth,
          percent
        })

        const emitCallback = (name, payload) => emitEvent(vnode, name, payload)
        // On drag, "drag" event can be replace by and "expand" or "reduce" event
        handleDragThresholds({ position, x, detail, reduceThreshold, expandThreshold, parentWidth, emitCallback })
      })

      return false
    }

    /**
     * Called when the dragging stops.
     * Cleans up event listeners and emits "dragend".
     */
    function onDragEnd() {
      emitEvent(vnode, 'dragend')
      document.removeEventListener('mousemove', onDragMove)
      document.removeEventListener('mouseup', onDragEnd)
      document.removeEventListener('touchmove', onDragMove)
      document.removeEventListener('touchend', onDragEnd)
    }

    /**
     * Called whenever the parent container is resized.
     * Recalculates position and possibly emits reduce/expand events.
     */
    function onResize(entries) {
      const entry = entries[0]
      const bindingValue = bindingHandlers.get(el)
      const targetElement = bindingValue.target
      const parentWidth = entry.contentRect.width
      const elementWidth = relative ? el.offsetWidth : 0

      // We measure the draggable element’s left in the parent
      const clientX = targetElement.getBoundingClientRect().x

      const { position, x, detail, reduceThreshold, expandThreshold } = calculateDragPosition({
        startX,
        initialClientX,
        clientX,
        bindingValue,
        elementWidth,
        parentWidth,
        percent
      })

      const emitCallback = (name, payload) => emitEvent(vnode, name, payload)
      // On resize, only "reduce" or "expand" events are considered
      handleResizeThresholds({ position, x, detail, reduceThreshold, expandThreshold, parentWidth, emitCallback })
    }

    // Attach event listeners to the “handle” element (the directive’s host)
    el.addEventListener('mousedown', startDrag)
    el.addEventListener('touchstart', startDrag)

    // Create and store a ResizeObserver for the parent container
    resizeObservers.set(el, new ResizeObserver(onResize))
  }
}
