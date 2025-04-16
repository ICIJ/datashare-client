<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useElementBounding } from '@vueuse/core'

import { useDocument } from '@/composables/useDocument'
import { useQueryObserver } from '@/composables/useQueryObserver'
import { useResizeObserver } from '@/composables/useResizeObserver'
import SeparatorLine from '@/components/SeparatorLine/SeparatorLine'

const props = defineProps({
  minStartWidth: {
    type: Number,
    default: 400
  },
  minEndWidth: {
    type: Number,
    default: 500
  },
  reduceThreshold: {
    type: Number,
    default: 100
  },
  expandThreshold: {
    type: Number,
    default: 100
  },
  noReduce: {
    type: Boolean
  },
  noExpand: {
    type: Boolean
  },
  fill: {
    type: Boolean
  }
})

const emit = defineEmits(['update:enoughtSpace'])

const elementRef = useTemplateRef('element')
const { querySelectorAll } = useQueryObserver(elementRef)
const { state: elementState } = useResizeObserver(elementRef)
const { top, left } = useElementBounding(elementRef)
const { provideDocumentViewFloatingId } = useDocument()
const documentViewFloatingId = provideDocumentViewFloatingId()

const fullWidth = computed(() => elementState.offsetWidth)

const separatorLineRight = computed({
  get() {
    return fullWidth.value - separatorLineLeft.value
  },
  set(right) {
    separatorLineLeft.value = fullWidth.value - right
  }
})

const separatorLineLeft = ref(props.minStartWidth)

const enoughtStartSpace = computed(() => separatorLineLeft.value >= props.minStartWidth)
const enoughtEndSpace = computed(() => separatorLineRight.value >= props.minEndWidth)
const enoughtSpace = computed(() => enoughtStartSpace.value && enoughtEndSpace.value)
watch(enoughtSpace, (value) => emit('update:enoughtSpace', value), { immediate: !!elementRef?.value?.$el })

const reachedZeroWidth = computed(() => separatorLineLeft.value === 0)
const reachedMinWidth = computed(() => separatorLineLeft.value <= props.minStartWidth)
const reachedFullWidth = computed(() => separatorLineLeft.value > fullWidth.value - props.minEndWidth)

const floatingChildren = querySelectorAll('.document-floating__start__floating > *', { immediate: false })
const hasFloatingChildren = computed(() => !!floatingChildren.value.length)
watch(hasFloatingChildren, (value) => value && resetStartSize())

const floatingSiblings = querySelectorAll('.document-floating__start__floating ~ *', { immediate: false })
const hasFloatingSiblings = computed(() => !!floatingSiblings.value.length)
watch(hasFloatingSiblings, (value) => value && resetStartSize())

const separatorLineStyle = computed(() => {
  const left = reachedFullWidth.value ? '100%' : `${separatorLineLeft.value}px`
  return { left }
})

const startStyle = computed(() => {
  const maxWidth = separatorLineStyle.value.left
  const flex = `${maxWidth} 0 0`
  return { maxWidth, flex }
})

const classList = computed(() => {
  return {
    'document-floating--enought-space': enoughtSpace.value,
    'document-floating--fill': props.fill,
    'document-floating--reached-zero-width': reachedZeroWidth.value,
    'document-floating--reached-min-width': reachedMinWidth.value,
    'document-floating--reached-full-width': reachedFullWidth.value,
    'document-floating--has-floating-children': hasFloatingChildren.value,
    'document-floating--has-floating-siblings': hasFloatingSiblings.value,
    'document-floating--has-floating': hasFloatingSiblings.value || hasFloatingChildren.value
  }
})

const style = computed(() => {
  return {
    '--document-floating-top': `${top.value}px`,
    '--document-floating-left': `${left.value}px`
  }
})

function drag(left) {
  separatorLineLeft.value = left
}

function reduce() {
  if (reachedMinWidth.value) {
    separatorLineLeft.value = 0
  } else {
    separatorLineLeft.value = props.minStartWidth
  }
}

function expand(left) {
  if (reachedZeroWidth.value) {
    separatorLineLeft.value = props.minStartWidth
  } else {
    separatorLineLeft.value = left
  }
}

function resetSize() {
  resetStartSize()
  resetEndSize()
}

function resetStartSize() {
  if (reachedZeroWidth.value) {
    separatorLineLeft.value = props.minStartWidth
  }
}

function resetEndSize() {
  if (reachedFullWidth.value) {
    separatorLineLeft.value = props.minStartWidth
  }
}

defineExpose({ resetSize, resetStartSize, resetEndSize })
</script>

<template>
  <div ref="element" class="document-floating" :class="classList" :style="style">
    <div class="document-floating__start" :style="startStyle">
      <slot name="floating" v-bind="{ documentViewFloatingId, enoughtSpace }">
        <div :id="documentViewFloatingId" class="document-floating__start__floating"></div>
      </slot>
      <slot name="start" v-bind="{ enoughtSpace }" />
    </div>
    <separator-line
      class="document-floating__separator-line"
      :style="separatorLineStyle"
      :no-reduce="noReduce"
      :no-expand="noExpand"
      :reduce-threshold="reduceThreshold"
      :reduce-disabled="reachedZeroWidth"
      :expand-threshold="expandThreshold"
      :expand-disabled="reachedFullWidth"
      :min-start="minStartWidth"
      :min-end="minEndWidth"
      @drag="drag"
      @reduce="reduce"
      @expand="expand"
    />
    <div class="document-floating__end">
      <slot v-bind="{ enoughtSpace }" />
    </div>
  </div>
</template>

<style lang="scss" floating>
.document-floating {
  position: relative;
  display: flex;

  &--fill {
    min-height: calc(100vh - var(--document-floating-top));
  }

  &--reached-zero-width &__start {
    visibility: hidden;
  }

  &--reached-full-width.document-floating--has-floating &__end {
    visibility: hidden;
  }

  &:not(.document-floating--enought-space) &__start,
  &:not(.document-floating--enought-space) &__end {
    overflow: hidden;
  }

  &__start {
    display: none;
    max-height: 100vh;
    position: sticky;
    top: 0;
    overflow: hidden;

    .document-floating--has-floating-children &,
    .document-floating--has-floating-children &__floating,
    .document-floating--has-floating-siblings & {
      display: block;
    }

    &__floating {
      position: sticky;
      z-index: 100;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      padding: $spacer;
      margin-right: $spacer;
      box-shadow: 0 $spacer 0 0 var(--bs-body-bg);
      background: var(--bs-action-bg-subtle);
      border-radius: var(--bs-border-radius);
      display: none;
      overflow: auto;
    }
  }

  &__separator-line {
    transform: translateX(-50%);
    display: none;

    .document-floating--has-floating-children &,
    .document-floating--has-floating-siblings & {
      display: block;
    }
  }

  &__end {
    min-width: 0;
    width: 100%;
    padding-left: $spacer;
  }
}
</style>
