<script setup>
import { computed } from 'vue'

import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import DocumentFloating from '@/components/Document/DocumentFloating.vue'
import DocumentView from '@/views/Document/DocumentView/DocumentView'
import { useViews } from '@/composables/useViews'
import { useCompact } from '@/composables/useCompact'
import { DISPLAY } from '@/enums/documentFloating'

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
const { compact } = useCompact(null, { threshold: 660 })
const display = computed(() => compact.value ? DISPLAY.END : DISPLAY.BOTH)
</script>

<template>
  <document-floating
    class="m-3"
    :display="display"
    no-reduce
    no-expand
    fill
  >
    <document-view
      :id="id"
      :routing="routing"
      :index="index"
      :q="q"
      :compact="compact"
    >
      <template
        v-if="!toggleSidebar"
        #header-start
      >
        <button-toggle-sidebar
          v-model:active="toggleSidebar"
          class="flex-shrink-0"
        />
      </template>
    </document-view>
  </document-floating>
</template>
