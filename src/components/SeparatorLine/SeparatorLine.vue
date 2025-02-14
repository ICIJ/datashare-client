<script setup>
import { computed, useTemplateRef } from 'vue'

import SeparatorLineDrag from './SeparatorLineDrag'
import SeparatorLineReduce from './SeparatorLineReduce'
import SeparatorLineExpand from './SeparatorLineExpand'

import { draggable as vDraggable } from '@/directives/draggable'
import { useResizeObserver } from '@/composables/resize-observer'

const props = defineProps({
  active: {
    type: Boolean
  },
  reduceDisabled: {
    type: Boolean
  },
  expandDisabled: {
    type: Boolean
  },
  min: {
    type: Number,
    default: 400
  },
  reduceThreshold: {
    type: Number,
    default: 100
  },
  expandThreshold: {
    type: Number,
    default: 100
  }
})

const classList = computed(() => {
  return {
    'separator-line--active': props.active
  }
})

const target = useTemplateRef('target')
const { state: targetState } = useResizeObserver(target)

const emit = defineEmits(['reduce', 'expand', 'drag', 'dragstart', 'dragend'])
const getMax = () => target.value.parentNode.getBoundingClientRect().width - targetState.offsetWidth
const reduce = () => emit('reduce', 0)
const expand = () => emit('expand', getMax())
</script>

<template>
  <div ref="target" class="separator-line" :class="classList">
    <div class="separator-line__buttons">
      <slot>
        <separator-line-reduce :disabled="reduceDisabled" @click="reduce" />
        <separator-line-drag
          v-draggable.relative="{ target, min, reduceThreshold, expandThreshold }"
          @reduce="reduce"
          @expand="expand"
          @drag="emit('drag', $event.detail)"
          @dragstart="emit('dragstart', $event.detail)"
          @dragend="emit('dragend', $event.detail)"
        />
        <separator-line-expand :disabled="expandDisabled" @click="expand" />
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.separator-line {
  width: 2rem;
  height: 100%;
  min-height: 440px;
  top: 0;
  position: absolute;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
    background-color: var(--bs-tertiary-border-subtle);
  }

  &:hover:before,
  &--active:before {
    width: 2px;
    background-color: var(--bs-action-text-emphasis);
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
    position: sticky;
    transform: translateY(-50%);
    top: 50vh;
    height: 240px;
    width: 2rem;
    max-height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    &:deep(.button-icon) {
      border-color: var(--bs-action-text-emphasis);

      .phosphor-icon {
        height: 100%;
        width: 100%;
      }
    }

    &:deep(.button-icon:hover) {
      border-width: 2px;
      color: var(--bs-body-color);
      background: var(--bs-body-bg);
    }

    &:deep(.button-icon[disabled]) {
      opacity: 1;
      background: var(--bs-body-bg);
      color: var(--bs-tertiary-border-subtle);
      border-color: var(--bs-tertiary-border-subtle);
    }
  }
}
</style>
