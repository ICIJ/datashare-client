<script setup>
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import DocumentFloating from '@/components/Document/DocumentFloating.vue'
import DocumentView from '@/views/Document/DocumentView/DocumentView'
import { useViews } from '@/composables/useViews'

defineProps({
  id: {
    type: String
  },
  routing: {
    type: String
  },
  index: {
    type: String
  },
  q: {
    type: String,
    default: ''
  }
})

const { toggleSidebar } = useViews()
</script>

<template>
  <document-floating class="m-3" no-reduce no-expand fill>
    <document-view :id="id" :routing="routing" :index="index" :q="q">
      <template v-if="!toggleSidebar" #header-start>
        <button-toggle-sidebar v-model:active="toggleSidebar" class="flex-shrink-0" />
      </template>
    </document-view>
  </document-floating>
</template>
