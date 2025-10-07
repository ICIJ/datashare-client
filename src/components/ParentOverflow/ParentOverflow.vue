<script setup>
import { useTemplateRef, useSlots, computed } from 'vue'
import { useElementSize } from '@vueuse/core'
import { useCloneSize } from '@/composables/useCloneSize'

defineOptions({ name: 'ParentOverflow' })

const slots = useSlots()

const container = useTemplateRef('container')
const content = useTemplateRef('content')

const { width: containerWidth } = useElementSize(container)
const { width: contentWidth } = useCloneSize(content)

const overflow = computed(() => contentWidth.value > containerWidth.value)
const noFallback = computed(() => !slots.fallback || !overflow.value)
</script>

<template>
  <div
    ref="container"
    class="parent-overflow"
    :class="{ 'parent-overflow--overflow': overflow }"
  >
    <div
      v-if="noFallback"
      ref="content"
      class="parent-overflow__content"
    >
      <slot v-bind="{ overflow, overflowBlock, overflowInline }" />
    </div>

    <template v-if="overflow">
      <slot
        name="fallback"
        v-bind="{ overflow, overflowBlock, overflowInline }"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.parent-overflow {
  overflow: hidden;
  flex-grow: 0;
  min-width: 0;

  &__content {
    overflow: visible;
    min-width: max-content;

    & > * {
      min-width: max-content;
    }
  }
}
</style>
