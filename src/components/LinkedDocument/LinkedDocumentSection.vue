<template>
  <b-accordion
    flush
    class="linked-document-section rounded-end col-12 col-md-6 m-0 pe-1"
  >
    <b-accordion-item
      v-model="open"
      :header-class="headerClass"
      button-class="rounded"
    >
      <template #title>
        <slot name="title">
          <linked-document-section-header
            :title="title"
            :icon="icon"
          />
        </slot>
      </template>
      <linked-document-section-list
        :description="description"
        :documents="documents"
        :to-search="toSearch"
      />
    </b-accordion-item>
  </b-accordion>
</template>

<script setup>
import LinkedDocumentSectionList from '@/components/LinkedDocument/LinkedDocumentSectionList.vue'
import LinkedDocumentSectionHeader from '@/components/LinkedDocument/LinkedDocumentSectionHeader.vue'

defineOptions({
  name: 'LinkedDocumentSection'
})

const open = defineModel({ type: Boolean, default: false })

defineProps({
  description: {
    type: String,
    required: true
  },
  title: {
    type: String
  },
  icon: {
    type: String
  },
  headerClass: {
    type: String
  },
  documents: {
    type: Array
  },
  toSearch: {
    type: Object
  }
})
</script>

<style lang="scss" scoped>
.linked-document-section {
  --bs-accordion-border-width: 0;
  --bs-accordion-bg: transparent; // or any color you want
  --bs-accordion-btn-bg: var(--bs-tertiary-bg-subtle);
  --bs-accordion-active-bg: var(--bs-tertiary-bg-subtle);
  --bs-accordion-active-color: var(--bs-tertiary-emphasis-text);
}
</style>
