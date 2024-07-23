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
    default: null
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

const show = computed(() => {
  return props.occurrences !== null
})

const style = computed(() => {
  return { maxWidth: props.maxWidth }
})
</script>

<template>
  <div class="document-local-search-occurrences" v-if="show" :style="style" v-ellipsis-tooltip="{ title: label }">
    {{ label }}
  </div>
</template>

<style lang="scss" scoped>
.document-local-search-occurrences {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
