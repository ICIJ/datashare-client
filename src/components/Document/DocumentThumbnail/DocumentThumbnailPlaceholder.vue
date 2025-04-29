<script setup>
import { computed } from 'vue'

import { useSchema } from '@/composables/useSchema'
import DisplayContentTypeIcon from '@/components/Display/DisplayContentTypeIcon'

const { document } = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { getContentTypeDisplay } = useSchema()

const display = computed(() => getContentTypeDisplay(document.contentType))
const style = computed(() => {
  const background = display.value.background
  return { background }
})
</script>

<template>
  <span class="document-thumbnail-placeholder" :style="style">
    <display-content-type-icon :value="document.contentType" colorize />
  </span>
</template>

<style lang="scss" scoped>
.document-thumbnail-placeholder {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bs-tertiary-bg-subtle);
}
</style>
