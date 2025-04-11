<template>
  <div class="linked-document-card bg-tertiary-subtle rounded row gx-0">
    <b-accordion flush :class="accordionClass">
      <b-accordion-item v-model="open" header-class="rounded-start" button-class="rounded btn btn-tertiary">
        <template #title>
          <linked-document-section-header
            :title="t('linkedDocumentCard.siblings.title', { n: siblings.length })"
            icon="files"
            :to-search="toSiblings"
          />
        </template>
        <linked-document-section :description="t('linkedDocumentCard.siblings.description')" :documents="siblings" />
      </b-accordion-item>
    </b-accordion>
    <b-accordion flush :class="accordionClass">
      <b-accordion-item v-model="open" header-class="rounded-end" button-class="rounded">
        <template #title>
          <linked-document-section-header
            :title="t('linkedDocumentCard.children.title', { n: children.length })"
            icon="paperclip"
            :to-search="toChildren"
          />
        </template>
        <linked-document-section :description="t('linkedDocumentCard.children.description')" :documents="children" />
      </b-accordion-item>
    </b-accordion>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import LinkedDocumentSectionHeader from '@/components/LinkedDocument/LinkedDocumentSectionHeader'
import LinkedDocumentSection from '@/components/LinkedDocument/LinkedDocumentSection.vue'
defineOptions({
  name: 'LinkedDocumentCard'
})
const open = ref(false)
defineProps({
  siblings: {
    type: Array,
    required: true
  },
  toSiblings: {
    type: [Object, String]
  },
  children: {
    type: Array,
    required: true
  },
  toChildren: {
    type: [Object, String]
  }
})
const { t } = useI18n()
const accordionClass = 'rounded-end col-12 col-lg-6 m-0 pe-1'
</script>

<style lang="scss" scoped>
.linked-document-card {
  &--collapse {
    height: 68px;
    overflow: hidden;
  }
  .accordion {
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
