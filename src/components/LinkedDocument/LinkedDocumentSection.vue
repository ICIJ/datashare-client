<template>
  <section class="linked-document-section">
    <div class="ms-3 d-flex flex-column flex-grow-1">
      <p class="linked-document-section__description">
        <slot name="description">{{ description }}</slot>
      </p>
      <div class="d-flex flex-column flex-grow-1">
        <slot name="document-list" v-bind="{ documents }">
          <linked-document-list :documents="documents" />
        </slot>
      </div>
    </div>
  </section>
</template>

<script setup>
import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'
defineOptions({
  name: 'LinkedDocumentSection'
})
defineProps({
  description: {
    type: String,
    required: true
  },
  documents: {
    type: Array
  }
})
</script>
<style lang="scss" scoped>
.linked-document-section {
  &__description {
    text-wrap: pretty;
  }
}
</style>
