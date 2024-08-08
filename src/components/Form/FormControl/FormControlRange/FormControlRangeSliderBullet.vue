<script setup>
import { range } from 'd3'
import { computed, ref } from 'vue'

import { draggable as vDraggable } from '@/directives/draggable'

const props = defineProps({
  modelValue: {
    type: Number
  },
  step: {
    type: Number
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  }
})

const target = ref(null)
const active = ref(false)

const steps = computed(() => {
  return range(props.min, props.max + props.step, props.step)
})

const modelValueStep = computed(() => {
  return steps.value.indexOf(props.modelValue)
})

const style = computed(() => {
  const width = 100 / steps.value.length
  const left = width * modelValueStep.value

  return {
    left: `${left}%`,
    width: `${width}%`
  }
})

const emit = defineEmits(['update:modelValue'])

const drag = ({ detail: x }) => {
  active.value = true
  const index = Math.round(steps.value.length * (x / 100))
  emit('update:modelValue', steps.value[index])
}

const dragend = () => {
  active.value = false
}

const classList = computed(() => {
  return {
    'form-control-range-slider-bullet--active': active.value
  }
})
</script>

<template>
  <a
    ref="target"
    v-draggable.relative.percent="{ target }"
    class="form-control-range-slider-bullet"
    :class="classList"
    :style="style"
    aria-live
    @drag="drag"
    @dragend="dragend"
  ></a>
</template>

<style lang="scss" scoped>
.form-control-range-slider-bullet {
  position: absolute;
  height: 1px;
  left: 0;
  top: 0;
  cursor: ew-resize;

  &:hover:after {
    box-shadow: 0 0 0 1px var(--bs-white), 0 0 0 2px var(--bs-link-hover-color);
  }

  &:active:after,
  &:focus-visible:after,
  &--active:after,
  &--active:hover:after {
    box-shadow: 0 0 0 1px var(--bs-white), $focus-ring-box-shadow;
  }

  &:after {
    content: '';
    display: block;
    border-radius: 50%;
    height: 6px;
    width: 6px;
    background-color: var(--bs-action);

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:before {
    content: '';
    display: block;
    height: 1em;
    transform: translateY(-50%);
  }
}
</style>
