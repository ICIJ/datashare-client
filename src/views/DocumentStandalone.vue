<script setup>
import { useDocument } from '@/composables/document'
import DocumentView from '@/views/Document/DocumentView/DocumentView'

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

const { provideDocumentViewFloatingId } = useDocument()
const documentViewFloatingId = provideDocumentViewFloatingId()
</script>

<template>
  <div class="document-standalone px-5 py-3">
    <div :id="documentViewFloatingId" class="document-standalone__floating"></div>
    <div class="document-standalone__view">
      <document-view :id="id" :routing="routing" :index="index" :q="q" />
    </div>
  </div>
</template>

<style lang="scss" floating>
.document-standalone {
  display: flex;
  height: 100%;

  &__floating {
    flex: 470px 0 0;
    position: sticky;
    z-index: 100;
    top: $spacer;
    left: 0;
    right: 0;
    height: 100%;
    max-height: calc(100vh - #{$spacer * 2});
    padding: $spacer;
    margin-right: $spacer;
    box-shadow: 0 $spacer 0 0 var(--bs-body-bg);
    background: var(--bs-action-bg-subtle);
    border-radius: var(--bs-border-radius);
    display: none;
    overflow: auto;

    &:has(*:not(:empty)) {
      display: block;
    }
  }

  &__view {
    min-width: 0;
    width: 100%;
  }
}
</style>
