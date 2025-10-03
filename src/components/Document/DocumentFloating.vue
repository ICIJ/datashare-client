<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useElementBounding } from '@vueuse/core'

import { useDocument } from '@/composables/useDocument'
import { useQueryObserver } from '@/composables/useQueryObserver'
import { useResizeObserver } from '@/composables/useResizeObserver'
import { DISPLAY, displayValidator } from '@/enums/documentFloating'
import SeparatorLine from '@/components/SeparatorLine/SeparatorLine'

const props = defineProps({
  display: {
    type: String,
    default: DISPLAY.BOTH,
    validator: displayValidator
  },
  minStartWidth: {
    type: Number,
    default: 400
  },
  minEndWidth: {
    type: Number,
    default: 600
  },
  reduceThreshold: {
    type: Number,
    default: 100
  },
  expandThreshold: {
    type: Number,
    default: 100
  },
  enoughSpaceThreshold: {
    type: Number,
    default: 900
  },
  noReduce: {
    type: Boolean
  },
  noExpand: {
    type: Boolean
  },
  fill: {
    type: Boolean
  },
  startClass: {
    type: [String, Object, Array]
  },
  endClass: {
    type: [String, Object, Array]
  }
})

const emit = defineEmits(['update:enoughSpace'])

const elementRef = useTemplateRef('element')
const { querySelectorAll } = useQueryObserver(elementRef)
const { state: elementState } = useResizeObserver(elementRef)
const { top, left } = useElementBounding(elementRef)
const { provideDocumentViewFloatingId } = useDocument()
const documentViewFloatingId = provideDocumentViewFloatingId()

const separatorLineLeft = ref(props.minStartWidth)
const separatorLineRight = computed(() => elementState.offsetWidth - separatorLineLeft.value)

const enoughStartSpace = computed(() => separatorLineLeft.value >= props.minStartWidth)
const enoughEndSpace = computed(() => separatorLineRight.value >= props.minEndWidth)
const enoughSpace = computed(() => enoughStartSpace.value && enoughEndSpace.value && elementState.offsetWidth >= props.enoughSpaceThreshold)
watch(enoughSpace, value => emit('update:enoughSpace', value), { immediate: !!elementRef?.value?.$el })

const reachedZeroWidth = computed(() => separatorLineLeft.value === 0)
const reachedMinWidth = computed(() => separatorLineLeft.value <= props.minStartWidth)

const floatingChildren = querySelectorAll('.document-floating__start__floating > *', { immediate: false })
const hasFloatingChildren = computed(() => !!floatingChildren.value.length)
watch(hasFloatingChildren, value => value && resetStartSize())

const floatingSiblings = querySelectorAll('.document-floating__start__floating ~ *', { immediate: false })
const hasFloatingSiblings = computed(() => !!floatingSiblings.value.length)
watch(hasFloatingSiblings, value => value && resetStartSize())

const separatorLineStyle = computed(() => {
  const left = `${separatorLineLeft.value}px`
  return { left }
})

const startStyle = computed(() => {
  if (props.display !== DISPLAY.BOTH) {
    return {}
  }
  const maxWidth = separatorLineStyle.value.left
  const flex = `${maxWidth} 0 0`
  return { maxWidth, flex }
})

const classList = computed(() => {
  return {
    'document-floating--fill': props.fill,
    'document-floating--display-start': props.display === DISPLAY.START,
    'document-floating--display-end': props.display === DISPLAY.END,
    'document-floating--reached-zero-width': reachedZeroWidth.value,
    'document-floating--reached-min-width': reachedMinWidth.value,
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

function resetStartSize() {
  if (reachedZeroWidth.value) {
    separatorLineLeft.value = props.minStartWidth
  }
}
</script>

<template>
  <div
    ref="element"
    class="document-floating"
    :class="classList"
    :style="style"
  >
    <div
      class="document-floating__start"
      :style="startStyle"
      :class="startClass"
    >
      <slot
        name="floating"
        v-bind="{ documentViewFloatingId, enoughSpace }"
      >
        <div
          :id="documentViewFloatingId"
          class="document-floating__start__floating"
        />
      </slot>
      <slot
        name="start"
        v-bind="{ enoughSpace }"
      />
    </div>
    <separator-line
      class="document-floating__separator-line"
      :style="separatorLineStyle"
      :no-reduce="noReduce"
      :no-expand="noExpand"
      :reduce-threshold="reduceThreshold"
      :reduce-disabled="reachedZeroWidth"
      :expand-threshold="expandThreshold"
      expand-disabled
      :min-start="minStartWidth"
      :min-end="minEndWidth"
      @drag="drag"
    />
    <div
      class="document-floating__end"
      :class="endClass"
    >
      <slot v-bind="{ enoughSpace }" />
    </div>
  </div>
</template>

<style lang="scss" floating>
.document-floating {
  --document-floating-min-height: auto;
  --document-floating-start-visibility: visible;
  --document-floating-start-display: none;
  --document-floating-start-max-height: 100vh;
  --document-floating-start-position: sticky;
  --document-floating-start-overflow: hidden;
  --document-floating-start-min-width: 0;
  --document-floating-start-max-width: var(--document-floating-separator-line-left, auto);
  --document-floating-start-padding: 0;
  --document-floating-start-floating-margin-right: #{$spacer};
  --document-floating-start-floating-display: none;
  --document-floating-end-display: block;
  --document-floating-end-min-width: 0;
  --document-floating-end-max-width: none;
  --document-floating-end-max-height: none;
  --document-floating-end-padding-left: 0;
  --document-floating-end-position: static;
  --document-floating-end-overflow: visible;
  --document-floating-separator-line-display: none;

  position: relative;
  display: flex;
  min-height: var(--document-floating-min-height);

  &--fill {
    --document-floating-min-height: calc(100vh - var(--document-floating-top));
  }

  &--reached-zero-width {
    --document-floating-start-visibility: hidden;
  }

  &--has-floating-children,
  &--has-floating-siblings {
    --document-floating-start-display: block;
    --document-floating-separator-line-display: block;
    --document-floating-end-padding-left: #{$spacer};
  }

  &--has-floating-children {
    --document-floating-start-floating-display: flex;
  }

  &--display-end.document-floating--has-floating-children {
    --document-floating-start-display: block;
    --document-floating-start-min-width: 100%;
    --document-floating-end-display: none;
  }

  &--reached-full-width {
    --document-floating-start-floating-margin-right: 0;
  }

  &--display-start,
  &--display-end {
    --document-floating-separator-line-display: none;
    --document-floating-start-floating-margin-right: 0;
  }

  &--display-start {
    --document-floating-start-min-width: 100%;
    --document-floating-start-max-width: none;
    --document-floating-start-max-height: none;
    --document-floating-start-position: static;
    --document-floating-start-overflow: visible;
    --document-floating-start-display: block;
    --document-floating-end-display: none;
  }

  &--display-end {
    --document-floating-end-min-width: 100%;
    --document-floating-end-max-width: none;
    --document-floating-end-max-height: none;
    --document-floating-end-padding-left: 0;
    --document-floating-end-position: static;
    --document-floating-end-overflow: visible;
    --document-floating-start-display: none;
  }

  &__start {
    display: var(--document-floating-start-display);
    max-height: var(--document-floating-start-max-height);
    position: var(--document-floating-start-position);
    top: 0;
    overflow: var(--document-floating-start-overflow);
    min-width: var(--document-floating-start-min-width);
    max-width: var(--document-floating-start-max-width);
    visibility: var(--document-floating-start-visibility);

    &__floating {
      position: sticky;
      z-index: 100;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      padding: $spacer;
      margin-right: var(--document-floating-start-floating-margin-right);
      box-shadow: 0 $spacer 0 0 var(--bs-body-bg);
      background: var(--bs-action-bg-subtle);
      border-radius: var(--bs-border-radius);
      display: var(--document-floating-start-floating-display);
      flex-direction: column;
      gap: $spacer;
      overflow: auto;
    }
  }

  &__separator-line {
    transform: translateX(-50%);
    display: var(--document-floating-separator-line-display);
  }

  &__end {
    width: 100%;
    min-width: var(--document-floating-end-min-width);
    max-width: var(--document-floating-end-max-width);
    max-height: var(--document-floating-end-max-height);
    padding-left: var(--document-floating-end-padding-left);
    position: var(--document-floating-end-position);
    overflow: var(--document-floating-end-overflow);
    display: var(--document-floating-end-display);
  }
}
</style>
