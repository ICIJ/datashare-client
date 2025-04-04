<script setup>
import AppModal from '@/components/AppModal/AppModal'
import DocumentFloating from '@/components/Document/DocumentFloating'
import DocumentView from '@/views/Document/DocumentView/DocumentView'

const modelValue = defineModel({ type: Boolean, default: false })

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
</script>

<template>
  <app-modal v-model="modelValue" body-class="py-0 px-5" no-footer no-header no-header-close fullscreen lazy>
    <document-floating class="my-3" no-reduce no-expand>
      <slot>
        <document-view :id="id" :routing="routing" :index="index" :q="q" />
      </slot>
      <template #nav>
        <slot name="nav" />
      </template>
    </document-floating>
  </app-modal>
</template>
