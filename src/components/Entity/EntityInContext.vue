<script setup>
import { trim } from 'lodash'
import { computed, onBeforeMount } from 'vue'

import { useWait } from '@/composables/wait'
import EntityPopover from '@/components/Entity/EntityPopover/EntityPopover'
import { useDocumentStore } from '@/store/modules/document'
import { Highlight } from '@/utils/highlight'

const offset = defineModel('offset', { type: Number, default: 0 })

const props = defineProps({
  entity: {
    type: Object,
    required: true
  },
  document: {
    type: Object,
    required: true
  },
  target: {
    type: [String, Object, Function],
    required: true
  },
  excerptLength: {
    type: Number,
    default: 180
  }
})

const documentStore = useDocumentStore()
const { waitFor, loaderId } = useWait()

const hasBigContentTextLength = computed(() => props.document.hasBigContentTextLength)
const isContentLoaded = computed(() => documentStore.isContentLoaded)

const fetch = waitFor(loaderId, async () => {
  if (!isContentLoaded.value && !hasBigContentTextLength.value) {
    await documentStore.getContent()
  }
})

const highlight = (content) => {
  const length = props.entity.mention.length
  const start = excerptPrefix.value.length + offsetStart.value - excerptOffsetStart.value
  const ranges = [{ start, length }]
  return Highlight.create({ content }).ranges(ranges)
}

const content = computed(() => {
  return isContentLoaded.value ? props.document.content : ''
})

const excerpt = computed(() => {
  const substring = content.value.substring(excerptOffsetStart.value, excerptOffsetEnd.value)
  return [excerptPrefix.value, trim(substring), excerptSuffix.value].join('')
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
  return offsetStart.value + extraLength + Math.floor(props.excerptLength / 2)
})

const excerptPrefix = computed(() => {
  return excerptOffsetStart.value > 0 ? '...' : ''
})

const excerptSuffix = computed(() => {
  return excerptOffsetEnd.value < content.value.length ? '...' : ''
})

onBeforeMount(fetch)
</script>

<template>
  <entity-popover
    v-model:offset="offset"
    lazy
    :no-excerpt="hasBigContentTextLength"
    :excerpt="highlightedExcerpt"
    :language="document.language"
    :mention="entity.mention"
    :extractor="entity.extractor"
    :offsets="entity.offsets.length"
    :target="target"
  />
</template>
