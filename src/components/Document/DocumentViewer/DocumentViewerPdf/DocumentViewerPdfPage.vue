<script setup>
import '@tato30/vue-pdf/style.css'
import VueScrollTo from 'vue-scrollto'
import { VuePDF as VuePdf } from '@tato30/vue-pdf'
import { computed, toRef, toValue, useTemplateRef, watch } from 'vue'
import { useElementSize, useWindowSize, whenever, useElementVisibility } from '@vueuse/core'

import { useElementVisibilityOnce } from '@/composables/useElementVisibilityOnce'
import { useScrollParent } from '@/composables/useScrollParent'

const props = defineProps({
  pdf: {
    type: Object,
    required: true
  },
  page: {
    type: Number,
    default: 1
  },
  size: {
    type: Object,
    default: () => ({ ratio: 1, width: 0 })
  },
  highlightText: {
    type: [Array, String],
    default: null
  },
  highlightIndex: {
    type: Number,
    default: 0
  },
  scrollOffset: {
    type: Number,
    default: 0
  },
  rotation: {
    type: Number,
    default: 0
  },
  scale: {
    type: Number,
    default: 1
  },
  fitParent: {
    type: Boolean,
    default: false
  }
})

const HIGHLIGHT_CLASS = 'highlight'
const HIGHLIGHT_ACTIVE_CLASS = 'highlight--active'

const emit = defineEmits(['visible'])

const renderer = useTemplateRef('renderer')
const element = useTemplateRef('element')
const scrollParent = useScrollParent()
const isVisible = useElementVisibility(element, { threshold: 0.5 })
const isVisibleOnce = useElementVisibilityOnce(element)
const { height: windowHeight } = useWindowSize()
const { width } = useElementSize(element)
watch(width, () => renderer.value?.reload())

const style = computed(() => {
  const { ratio, width, height } = props.size
  const pageScale = props.scale || 1
  const pageWidth = props.fitParent || (rotationFlipped.value ? height : width) + 'px'
  const pageRatio = rotationFlipped.value ? 1 / ratio : ratio

  return {
    '--document-viewer-pdf-page-ratio': pageRatio,
    '--document-viewer-pdf-page-width': pageWidth,
    '--document-viewer-pdf-page-scale': pageScale
  }
})

const rotationFlipped = computed(() => props.rotation === 90 || props.rotation === 270)
const rendererHeight = computed(() => (props.fitParent && rotationFlipped.value ? width.value : null))
const rendererWidth = computed(() => (props.fitParent && !rotationFlipped.value ? width.value : null))

/**
 * Applies the highlight to the current page based on the highlight index.
 * It finds the highlight element by index and scrolls to it if it exists.
 */
function applyHighlight() {
  // Find the highlight element by index
  const highlights = [...element.value.getElementsByClassName(HIGHLIGHT_CLASS)]
  const highlight = highlights[props.highlightIndex - 1]
  // Remove all classes "highlight--active" from the page and highlight the current one
  highlights.forEach(el => el.classList.toggle(HIGHLIGHT_ACTIVE_CLASS, el === highlight))
  // Only scroll to the highlight/page if the current page has a highlight index
  if (props.highlightIndex && highlight) {
    // If no highlight is found, offset the scroll to the center of the page
    const offset = highlight ? windowHeight.value / -2 : props.scrollOffset
    const container = scrollParent.value
    const target = toValue(highlight || element)
    VueScrollTo.scrollTo(target, 0, { container, offset })
  }
}

whenever(toRef(props, 'highlightIndex'), applyHighlight)
whenever(isVisible, () => emit('visible'))
</script>

<template>
  <div
    ref="element"
    class="document-viewer-pdf-page"
    :style="style"
  >
    <vue-pdf
      v-if="isVisibleOnce || highlightIndex"
      :key="`${scale}-${rotation}-${fitParent}`"
      ref="renderer"
      class="document-viewer-pdf-page__renderer shadow-sm border overflow-hidden"
      text-layer
      :scale="scale"
      :rotation="rotation"
      :pdf="pdf"
      :page="page"
      :highlight-text="highlightText"
      :highlight-options="{ completeWords: false, ignoreCase: true }"
      :height="rendererHeight"
      :width="rendererWidth"
      @highlight="applyHighlight"
    />
    <div
      v-else
      class="document-viewer-pdf-page__placeholder"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-viewer-pdf-page {
  &__placeholder {
    width: calc(var(--document-viewer-pdf-page-scale) * var(--document-viewer-pdf-page-width, 100%));
    background: var(--bs-secondary-bg-subtle);
    aspect-ratio: var(--document-viewer-pdf-page-ratio);
  }

  &__renderer:deep(.highlight) {
    --highlight-bg-color: #{rgba($mark-bg, 0.5)};
  }

  &__renderer:deep(.highlight--active) {
    --highlight-bg-color: #{rgba(#38d878, 0.5)};
  }
}
</style>
