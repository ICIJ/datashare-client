<script setup>
import { computed, ref, watch } from 'vue'

import { useWait } from '@/composables/useWait'
import EntityPopover from '@/components/Entity/EntityPopover/EntityPopover'
import { useDocumentStore } from '@/store/modules'
import { Highlight } from '@/utils/highlight'

const offset = defineModel('offset', { type: Number, default: 0 })
const visiblePopover = defineModel('visiblePopover', { type: Boolean, default: false })

const props = defineProps({
  entity: {
    type: Object,
    required: true
  },
  excerptLength: {
    type: Number,
    default: 180
  }
})

const { getContentSlice, document } = useDocumentStore()
const { waitFor } = useWait()

const noExcerpt = computed(() => !!props.entity.metadata)
const content = ref('')

const fetch = waitFor(async () => {
  if (noExcerpt.value || !visiblePopover.value) return
  const offset = excerptOffsetStart.value
  const limit = excerptOffsetEnd.value - excerptOffsetStart.value
  const response = await getContentSlice({ offset, limit })
  content.value = response.content
})

const highlight = (content) => {
  const length = props.entity.mention.length
  const start = excerptPrefix.value.length + offsetStart.value - excerptOffsetStart.value
  const ranges = [{ start, length }]
  return Highlight.create({ content }).ranges(ranges)
}

const excerpt = computed(() => {
  return [excerptPrefix.value, content.value, excerptSuffix.value].join('')
})

const highlightedExcerpt = computed(() => {
  return highlight(excerpt.value)
})

const offsetStart = computed(() => {
  return props.entity.offsets[offset.value]
})

const excerptOffsetStart = computed(() => {
  return Math.max(0, offsetStart.value - Math.floor(props.excerptLength / 2))
})

const excerptOffsetEnd = computed(() => {
  const extraLength = Math.max(0, Math.floor(props.excerptLength / 2) - excerptOffsetStart.value)
  const maxLenght = document.contentTextLength
  return Math.min(maxLenght, offsetStart.value + extraLength + Math.floor(props.excerptLength / 2))
})

const excerptPrefix = computed(() => {
  return excerptOffsetStart.value > 0 ? '...' : ''
})

const excerptSuffix = computed(() => {
  return excerptOffsetEnd.value < content.value.length ? '...' : ''
})

watch(offset, fetch)
watch(visiblePopover, fetch, { immediate: true })
</script>

<template>
  <entity-popover
    v-model="visiblePopover"
    v-model:offset="offset"
    :excerpt="highlightedExcerpt"
    :no-excerpt="noExcerpt"
    :language="document.language"
    :mention="entity.mention"
    :extractor="entity.extractor"
    :offsets="entity.offsets.length"
  >
    <template #target>
      <slot name="target" />
    </template>
  </entity-popover>
</template>
