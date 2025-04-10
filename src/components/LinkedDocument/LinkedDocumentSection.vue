<template>
  <section class="linked-document-section">
    <p class="linked-document-section__title d-inline-flex gap-2 text-body-emphasis">
      <phosphor-icon :name="icon" />
      <slot name="title"> {{ documents.length }} {{ title }} </slot>
    </p>
    <div class="ms-4 d-flex flex-column flex-grow-1">
      <p class="linked-document-section__description">
        <slot name="description">{{ description }}</slot>
      </p>
      <div class="d-flex flex-column flex-grow-1">
        <slot name="document-list" v-bind="{ documents }">
          <linked-document-list :documents="documents" />
        </slot>
      </div>
      <p>
        <button-icon :icon-right="PhMagnifyingGlass" :label="t('linkedDocumentList.searchAll')" :to="toSearch" />
      </p>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { PhosphorIcon } from '@icij/murmur-next'

import ButtonIcon from '@/components/Button/ButtonIcon'
import LinkedDocumentList from '@/components/LinkedDocument/LinkedDocumentList'
defineOptions({
  name: 'LinkedDocumentSection'
})
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: [String, Object, Array],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  documents: {
    type: Array
  },
  toSearch: {
    type: [Object, String]
  }
})
const { t } = useI18n()
</script>
<style lang="scss" scoped>
.linked-document-section {
  &__title {
    font-weight: 500;
    text-wrap: pretty;
  }
  &__description {
    text-wrap: pretty;
  }
}
</style>
