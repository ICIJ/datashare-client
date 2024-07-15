<script setup>
import { computed, ref } from 'vue'
import { has, get, invoke, clamp } from 'lodash'

import SeparatorLineDrag from './SeparatorLineDrag'
import SeparatorLineReduce from './SeparatorLineReduce'
import SeparatorLineExpand from './SeparatorLineExpand'

const props = defineProps({
  active: Boolean,
  reduceDisabled: Boolean,
  expandDisabled: Boolean,
  min: {
    type: Number,
    default: 0
  }
})

const classList = computed(() => {
  return {
    'separator-line--active': props.active
  }
})

const root = ref(null)
const emit = defineEmits(['reduce', 'expand', 'drag', 'dragstart', 'dragend'])
const maxX = () => root.value.parentNode.getBoundingClientRect().width - root.value.getBoundingClientRect().width
const reduce = () => emit('reduce', 0)
const expand = () => emit('reduce', maxX())

const vDraggable = {
  mounted(el, binding, vnode) {
    let startX, initialClientX
    const relative = binding.modifiers?.relative ?? false
    const percent = binding.modifiers?.percent ?? false

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
      const offset = relative ? el.offsetWidth : 0
      const maxX = root.value.parentNode.getBoundingClientRect().width
      const x = clamp(startX + clientX - initialClientX, props.min, maxX - offset)
      const detail = percent ? (x / maxX) * 100 : x
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
      startX = root.value.offsetLeft
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
</script>

<template>
  <div ref="root" class="separator-line" :class="classList">
    <div class="separator-line__buttons">
      <slot>
        <separator-line-reduce :disabled="reduceDisabled" @click="reduce()" />
        <separator-line-drag
          v-draggable.relative
          @drag="emit('drag', $event.detail)"
          @dragstart="emit('dragstart', $event.detail)"
          @dragend="emit('dragend', $event.detail)"
        />
        <separator-line-expand :disabled="expandDisabled" @click="expand()" />
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.separator-line {
  width: 2em;
  height: 100%;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
    background-color: var(--bs-light-border-subtle);
  }

  &:hover:before,
  &--active:before {
    width: 2px;
    background-color: var(--bs-primary-text-emphasis);
  }

  &:hover &__buttons,
  &--active &__buttons {
    opacity: 1;
    pointer-events: all;
  }

  &__buttons {
    opacity: 0;
    pointer-events: none;
    transition: $transition-fade;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    max-height: 240px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &:deep(.icon-button) {
      border-color: var(--bs-primary-text-emphasis);

      .phosphor-icon {
        height: 100%;
        width: 100%;
      }
    }

    &:deep(.icon-button:hover) {
      border-width: 2px;
      color: var(--bs-body-color);
      background: var(--bs-body-bg);
    }

    &:deep(.icon-button[disabled]) {
      opacity: 1;
      background: var(--bs-body-bg);
      color: var(--bs-light-border-subtle);
      border-color: var(--bs-light-border-subtle);
    }
  }
}
</style>
