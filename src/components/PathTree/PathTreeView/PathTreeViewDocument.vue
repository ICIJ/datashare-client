<script setup>
import { computed } from 'vue'

import { useDocumentModal } from '@/composables/useDocumentModal'
import DisplayContentTypeIcon from '@/components/Display/DisplayContentTypeIcon'
import Document from '@/api/resources/Document'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'

const selected = defineModel('selected', { type: Boolean })

const { entry, selectMode } = defineProps({
  entry: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  compact: {
    type: Boolean,
    default: false
  },
  nested: {
    type: Boolean,
    default: false
  },
  selectMode: {
    type: Boolean,
    default: false
  }
})

const { show: showDocumentModal } = useDocumentModal()

const document = computed(() => {
  return entry instanceof Document ? entry : Document.create(entry)
})

const isLink = computed(() => {
  const { routerParams: params } = document.value
  return params.id && params.index && !selectMode
})

const to = computed(() => {
  const { routerParams: params } = document.value
  const name = 'document-standalone'
  return isLink.value ? { name, params } : null
})

const handleClick = (event) => {
  const { routerParams: params } = document.value
  if (isLink.value) {
    event.preventDefault()
    event.stopPropagation()
    showDocumentModal(params.index, params.id, params.routing)
  }
}
</script>

<template>
  <path-tree-view-entry
    v-model:selected="selected"
    no-link
    no-stats
    collapse
    type="document"
    :to="to"
    :level="level"
    :nested="nested"
    :compact="compact"
    :name="document.title"
    :path="document.path"
    :projects="[document.project]"
    @click="handleClick"
  >
    <template #icon>
      <display-content-type-icon
        :value="document.contentType"
        colorize
      />
    </template>
  </path-tree-view-entry>
</template>
