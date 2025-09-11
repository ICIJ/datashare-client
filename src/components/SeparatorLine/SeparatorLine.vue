<script setup>
import { computed, ref, useTemplateRef } from 'vue'

import SeparatorLineDrag from './SeparatorLineDrag'
import SeparatorLineReduce from './SeparatorLineReduce'
import SeparatorLineExpand from './SeparatorLineExpand'

import { draggable as vDraggable } from '@/directives/draggable'
import { useResizeObserver } from '@/composables/useResizeObserver'

const props = defineProps({
  active: {
    type: Boolean
  },
  noReduce: {
    type: Boolean
  },
  noExpand: {
    type: Boolean
  },
  reduceDisabled: {
    type: Boolean
  },
  expandDisabled: {
    type: Boolean
  },
  minStart: {
    type: Number,
    default: 400
  },
  minEnd: {
    type: Number,
    default: 400
  },
  reduceThreshold: {
    type: Number,
    default: 150
  },
  expandThreshold: {
    type: Number,
    default: 150
  }
})

const dragging = ref(false)

const classList = computed(() => {
  return {
    'separator-line--active': props.active,
    'separator-line--dragging': dragging.value
  }
})

const target = useTemplateRef('target')
const { state: targetState } = useResizeObserver(target)

const emit = defineEmits(['reduce', 'expand', 'drag', 'dragstart', 'dragend'])
const getMax = () => target.value.parentNode.getBoundingClientRect().width - targetState.offsetWidth
const reduce = () => {
  return !props.noReduce && emit('reduce', 0)
}
const expand = () => {
  return !props.noExpand && emit('expand', getMax())
}

const drag = ({ detail }) => {
  dragging.value = true
  emit('drag', detail)
}

const dragStart = ({ detail }) => {
  dragging.value = true
  emit('dragstart', detail)
}

const dragEnd = ({ detail }) => {
  dragging.value = false
  emit('dragend', detail)
}
</script>

<template>
  <div
    ref="target"
    class="separator-line"
    :class="classList"
  >
    <separator-line-drag
      v-draggable.relative="{ target, minStart, minEnd, reduceThreshold, expandThreshold }"
      class="separator-line__drag"
      :dragging="dragging"
      @expand="expand"
      @reduce="reduce"
      @drag="drag"
      @dragstart="dragStart"
      @dragend="dragEnd"
    />
    <div class="separator-line__buttons">
      <separator-line-reduce
        v-if="!noReduce"
        :disabled="reduceDisabled"
        @click="reduce"
      />
      <separator-line-expand
        v-if="!noExpand"
        :disabled="expandDisabled"
        @click="expand"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.separator-line {
  width: 3px;
  height: 100%;
  min-height: 5rem;
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

  // An invisible overlay only display when dragging to avoid
  // triggering hover effect on other components.
  &--dragging:after {
    content: '';
    position: fixed;
    top: 0;
    bottom: 0;
    left: -100vw;
    right: 0;
    opacity: 0;
  }

  &:hover:before,
  &--active:before {
    width: 2px;
    background-color: var(--bs-action-text-emphasis);
  }

  &:hover &__buttons,
  &--active &__buttons {
    opacity: 1;
  }

  &__drag {
    position: absolute;
    z-index: 10;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  &__buttons {
    opacity: 0;
    z-index: 20;
    transition: $transition-fade;
    position: sticky;
    top: 0;
    height: 100%;
    max-height: 100vh;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 75px;
    pointer-events: none;

    &:empty {
      display: none;
    }

    &:deep(.button-icon) {
      pointer-events: all;
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
