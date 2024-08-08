<script setup>
import { computed, ref } from 'vue'

import SeparatorLineDrag from './SeparatorLineDrag'
import SeparatorLineReduce from './SeparatorLineReduce'
import SeparatorLineExpand from './SeparatorLineExpand'

import { draggable as vDraggable } from '@/directives/draggable'

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

const target = ref(null)
const emit = defineEmits(['reduce', 'expand', 'drag', 'dragstart', 'dragend'])
const getMax = () => target.value.parentNode.getBoundingClientRect().width - target.value.getBoundingClientRect().width
const reduce = () => emit('reduce', 0)
const expand = () => emit('reduce', getMax())
</script>

<template>
  <div ref="target" class="separator-line" :class="classList">
    <div class="separator-line__buttons">
      <slot>
        <separator-line-reduce :disabled="reduceDisabled" @click="reduce()" />
        <separator-line-drag
          v-draggable.relative="{ target, min }"
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
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100%;
    max-height: 240px;
    display: flex;
    flex-direction: column;
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
