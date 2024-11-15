<script setup>
import { computed, ref, useTemplateRef } from 'vue'

import { useDocument } from '@/composables/document'
import { useQueryObserver } from '@/composables/query-observer'
import SeparatorLine from '@/components/SeparatorLine/SeparatorLine'

const props = defineProps({
  minWidth: {
    type: Number,
    default: 400
  }
})

const elementRef = useTemplateRef('element')
const { querySelectorAll } = useQueryObserver(elementRef)
const { provideDocumentViewFloatingId } = useDocument()
const documentViewFloatingId = provideDocumentViewFloatingId()

const reachedMinWidth = computed(() => separatorLineLeft.value <= props.minWidth)
const separatorLineLeft = ref(450)

const floatingChildren = querySelectorAll('.document-floating__start__floating > *')
const floatingSiblings = querySelectorAll('.document-floating__start__floating ~ *')

const hasFloatingChildren = computed(() => !!floatingChildren.value.length)
const hasFloatingSiblings = computed(() => !!floatingSiblings.value.length)

const separatorLineStyle = computed(() => {
  return {
    left: `${separatorLineLeft.value}px`
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
    'document-floating--has-floating-children': hasFloatingChildren.value,
    'document-floating--has-floating-siblings': hasFloatingSiblings.value
  }
})
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
      :reduce-disabled="reachedMinWidth"
      :min="minWidth"
      @drag="separatorLineLeft = $event"
      @reduce="separatorLineLeft = minWidth"
      @expand="separatorLineLeft = $event"
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
