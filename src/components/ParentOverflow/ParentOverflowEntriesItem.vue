<script setup>
import { noop } from 'lodash'
import { computed, getCurrentInstance, inject, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { useElementSize } from '@vueuse/core'

defineOptions({ name: 'ParentOverflowEntriesItem' })

const { label, context } = defineProps({
  label: {
    type: String,
    required: true
  },
  context: {
    type: [Object, String, Number, Array],
    default: null
  }
})

const element = useTemplateRef('element')
const entry = getCurrentInstance()
const size = useElementSize(element)

const registerEntry = inject('registerEntry', noop)
const unregisterEntry = inject('unregisterEntry', noop)
const getEntryVisibility = inject('getEntryVisibility', noop)
const getEntryBinding = inject('getEntryBinding', noop)

onMounted(() => registerEntry(entry))
onUnmounted(() => unregisterEntry(entry))

const classList = computed(() => {
  return {
    'parent-overflow-entries-item--hidden': !getEntryVisibility(entry)
  }
})

defineExpose({ size, label, context })
</script>

<template>
  <div
    ref="element"
    class="parent-overflow-entries-item"
    :class="classList"
  >
    <slot v-bind="getEntryBinding(entry)" />
  </div>
</template>

<style lang="scss" scoped>
.parent-overflow-entries-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  white-space: nowrap;

  &--hidden {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    z-index: -1;
    contain: layout style paint;
  }
}
</style>
