<script setup>
import DocumentTitleSliceRoot from '@/components/Document/DocumentTitle/DocumentTitleSliceRoot'
import DocumentTitleSliceFirst from '@/components/Document/DocumentTitle/DocumentTitleSliceFirst'
import DocumentTitleSliceMiddle from '@/components/Document/DocumentTitle/DocumentTitleSliceMiddle'
import DocumentTitleSliceLast from '@/components/Document/DocumentTitle/DocumentTitleSliceLast'

defineOptions({
  name: 'DocumentTitleSlice'
})

defineProps({
  slice: {
    type: String,
    required: true
  },
  isRoot: {
    type: Boolean,
    default: false
  },
  isFirst: {
    type: Boolean,
    default: false
  },
  isMiddle: {
    type: Boolean,
    default: false
  },
  document: {
    type: Object,
    required: true
  },
  interactiveRoot: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <span class="document-title-slice">
    <document-title-slice-root
      v-if="isRoot && interactiveRoot"
      :document="document"
      :slice="slice"
    />
    <document-title-slice-first
      v-else-if="isFirst"
      :slice="slice"
    />
    <document-title-slice-middle v-else-if="isMiddle" />
    <document-title-slice-last
      v-else
      :slice="slice"
    />
  </span>
</template>
