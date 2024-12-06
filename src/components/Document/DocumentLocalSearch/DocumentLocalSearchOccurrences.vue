<script setup>
import { computed } from 'vue'
import { EllipsisTooltip as vEllipsisTooltip } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  activeIndex: {
    type: Number,
    default: 0
  },
  occurrences: {
    type: Number,
    default: 0
  },
  hidden: {
    type: Boolean
  },
  maxWidth: {
    type: String,
    default: '100px'
  }
})

const { t, n } = useI18n()

const label = computed(() => {
  const activeIndex = n(props.activeIndex)
  const occurrences = n(props.occurrences)
  return t('documentLocalSearchOccurrences.label', { activeIndex, occurrences })
})

const style = computed(() => {
  return { maxWidth: props.maxWidth }
})

const key = computed(() => {
  return `${props.activeIndex}-${props.occurrences}`
})

const classList = computed(() => {
  return {
    'document-local-search-occurrences--hidden': props.hidden
  }
})
</script>

<template>
  <div
    :key="key"
    v-ellipsis-tooltip="{ title: label }"
    class="document-local-search-occurrences"
    :class="classList"
    :style="style"
  >
    {{ label }}
  </div>
</template>

<style lang="scss" scoped>
.document-local-search-occurrences {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  &--hidden {
    visibility: hidden;
  }
}
</style>
