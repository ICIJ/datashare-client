<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'

import { useDocument } from '@/composables/document'
import { useQueryObserver } from '@/composables/query-observer'
import { useResizeObserver } from '@/composables/resize-observer'
import SeparatorLine from '@/components/SeparatorLine/SeparatorLine'

const props = defineProps({
  minWidth: {
    type: Number,
    default: 400
  },
  reduceThreshold: {
    type: Number,
    default: 100
  },
  expandThreshold: {
    type: Number,
    default: 600
  }
})

const elementRef = useTemplateRef('element')
const { querySelectorAll } = useQueryObserver(elementRef)
const { state: elementState } = useResizeObserver(elementRef)
const { provideDocumentViewFloatingId } = useDocument()
const documentViewFloatingId = provideDocumentViewFloatingId()

const fullWidth = computed(() => elementState.offsetWidth)
const reachedZeroWidth = computed(() => separatorLineLeft.value === 0)
const reachedMinWidth = computed(() => separatorLineLeft.value <= props.minWidth)
const reachedFullWidth = computed(() => separatorLineLeft.value > fullWidth.value - props.expandThreshold)
const separatorLineLeft = ref(450)

const emit = defineEmits(['update:full-width', 'update:zero-width'])
watch(reachedFullWidth, (value) => emit('update:fullWidth', value), { immediate: true })
watch(reachedZeroWidth, (value) => emit('update:zeroWidth', value), { immediate: true })

const floatingChildren = querySelectorAll('.document-floating__start__floating > *')
const floatingSiblings = querySelectorAll('.document-floating__start__floating ~ *')

const hasFloatingChildren = computed(() => !!floatingChildren.value.length)
const hasFloatingSiblings = computed(() => !!floatingSiblings.value.length)

const separatorLineStyle = computed(() => {
  return {
    left: reachedFullWidth.value ? '100%' : `${separatorLineLeft.value}px`
  }
})

const startStyle = computed(() => {
  return {
    maxWidth: `${separatorLineLeft.value}px`,
    flex: `${separatorLineLeft.value}px 0 0`
  }
})

const classList = computed(() => {
  return {
    'document-floating--reached-zero-width': reachedZeroWidth.value,
    'document-floating--reached-min-width': reachedMinWidth.value,
    'document-floating--reached-full-width': reachedFullWidth.value,
    'document-floating--has-floating-children': hasFloatingChildren.value,
    'document-floating--has-floating-siblings': hasFloatingSiblings.value
  }
})

function drag(left) {
  separatorLineLeft.value = left
}

function reduce() {
  if (reachedMinWidth.value) {
    separatorLineLeft.value = 0
  } else {
    separatorLineLeft.value = props.minWidth
  }
}

function expand(left) {
  if (reachedZeroWidth.value) {
    separatorLineLeft.value = props.minWidth
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
    separatorLineLeft.value = props.minWidth
  }
}

function resetEndSize() {
  if (reachedFullWidth.value) {
    separatorLineLeft.value = props.minWidth
  }
}

defineExpose({ resetSize, resetStartSize, resetEndSize })
</script>

<template>
  <div ref="element" class="document-floating" :class="classList">
    <div class="document-floating__start" :style="startStyle">
      <slot name="floating" v-bind="{ documentViewFloatingId }">
        <div :id="documentViewFloatingId" class="document-floating__start__floating"></div>
      </slot>
      <slot name="start" />
    </div>
    <separator-line
      class="document-floating__separator-line"
      :style="separatorLineStyle"
      :reduce-threshold="reduceThreshold"
      :reduce-disabled="reachedZeroWidth"
      :expand-threshold="expandThreshold"
      :expand-disabled="reachedFullWidth"
      :min="minWidth"
      @drag="drag"
      @reduce="reduce"
      @expand="expand"
    />
    <div class="document-floating__end">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" floating>
.document-floating {
  position: relative;
  display: flex;

  &--reached-zero-width &__start {
    visibility: hidden;
  }

  &--reached-full-width &__end {
    visibility: hidden;
  }

  &__start {
    display: none;
    max-height: 100vh;
    position: sticky;
    top: 0;

    .document-floating--has-floating-children &,
    .document-floating--has-floating-children &__floating,
    .document-floating--has-floating-siblings & {
      display: block;
    }

    &__floating {
      position: sticky;
      z-index: 100;
      top: $spacer;
      left: 0;
      right: 0;
      height: 100%;
      max-height: calc(100vh - #{$spacer * 2});
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
