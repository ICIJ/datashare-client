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

defineExpose({ resetStartSize })
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
  position: relative;
  display: flex;

  &--fill {
    min-height: calc(100vh - var(--document-floating-top));
  }

  &--reached-zero-width &__start {
    visibility: hidden;
  }

  &__start {
    display: none;
    max-height: 100vh;
    position: sticky;
    top: 0;
    overflow: hidden;

    .document-floating--has-floating-children &,
    .document-floating--has-floating-siblings & {
      display: block;
    }

    .document-floating--has-floating-children &__floating {
      display: flex;
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
      flex-direction: column;
      gap: $spacer;
      overflow: auto;

      .document-floating--reached-full-width & {
        margin-right: 0;
      }
    }
  }

  &__separator-line {
    transform: translateX(-50%);
    display:none;

    .document-floating--has-floating-children &,
    .document-floating--has-floating-siblings & {
      display: block;
    }
  }

  &__end {
    min-width: 0;
    width: 100%;

    .document-floating--has-floating-children &,
    .document-floating--has-floating-siblings & {
      padding-left: $spacer;
    }
  }

  &--display-start {
    .document-floating__start {
      min-width: 100%;
    }

    .document-floating__end,
    .document-floating__separator-line {
      display: none;
    }
  }

  &--display-end {
    .document-floating__end {
      min-width: 100%;
      padding-left: 0;
    }

    .document-floating__start,
    .document-floating__separator-line {
      display: none;
    }

    &.document-floating--has-floating-children  {
      .document-floating__start {
        display: block;
        min-width: 100%;
      }

      .document-floating__end {
        display: none;
      }
    }
  }
}
</style>
