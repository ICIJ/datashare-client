<template>
  <b-accordion flush class="linked-document-section rounded-end col-12 col-lg-6 m-0 pe-1">
    <b-accordion-item v-model="open" :header-class="headerClass" button-class="rounded btn btn-tertiary">
      <template #title>
        <slot name="title"> <linked-document-section-header :title="title" :icon="icon" /> </slot>
      </template>
      <linked-document-section-list :description="description" :documents="documents" :to-search="toSearch" />
    </b-accordion-item>
  </b-accordion>
</template>

<script setup>
import LinkedDocumentSectionList from '@/components/LinkedDocument/LinkedDocumentSectionList.vue'
import LinkedDocumentSectionHeader from '@/components/LinkedDocument/LinkedDocumentSectionHeader.vue'

const open = defineModel({ type: Boolean, default: false })
defineOptions({
  name: 'LinkedDocumentSection'
})
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
  &.accordion {
    --bs-accordion-border-width: 0;
    --bs-accordion-bg: transparent; // or any color you want
    --bs-accordion-btn-bg: #{$tertiary-bg-subtle};
    --bs-accordion-active-bg: #{$tertiary-bg-subtle};
    --bs-accordion-active-color: #{$tertiary-text-emphasis};

    [data-bs-theme='dark'] & {
      --bs-accordion-active-bg: #{$tertiary-bg-subtle-dark};
      --bs-accordion-bg: transparent;
      --bs-accordion-btn-bg: #{$tertiary-bg-subtle-dark};
      --bs-accordion-active-color: #{$tertiary-text-emphasis-dark};
    }
  }
}
</style>
