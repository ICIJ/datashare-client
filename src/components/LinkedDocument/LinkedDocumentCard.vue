<template>
  <div
    class="linked-document-card d-flex rounded align-items-start bg-tertiary-subtle text-body justify-content-between"
    :class="{ 'linked-document-card--collapse': !modelValue }"
  >
    <div class="d-flex flex-column flex-sm-row flex-grow-1 w-75 justify-content-between">
      <linked-document-section
        :title="t('linkedDocumentCard.siblings.title')"
        icon="files"
        :description="t('linkedDocumentCard.siblings.description')"
        :documents="siblings"
        class="col-12 col-sm-6 p-4"
      />
      <linked-document-section
        :title="t('linkedDocumentCard.children.title')"
        icon="paperclip"
        :description="t('linkedDocumentCard.children.description')"
        :documents="children"
        class="col-12 col-sm-6 p-4"
      />
    </div>
    <span class="linked-document-card__toggle m-2 d-flex justify-content-center" @click="toggle">
      <phosphor-icon :name="caretIcon" class="linked-document-card__toggle--btn btn btn-md border-0" />
    </span>
  </div>
</template>

<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import LinkedDocumentSection from '@/components/LinkedDocument/LinkedDocumentSection'
defineOptions({
  name: 'LinkedDocumentCard'
})
const modelValue = defineModel({
  type: Boolean,
  required: true
})
defineProps({
  siblings: {
    type: Array,
    required: true
  },
  children: {
    type: Array,
    required: true
  }
})
const { t } = useI18n()
const caretIcon = computed(() => {
  return modelValue.value ? 'caret-up' : 'caret-down'
})
function toggle() {
  modelValue.value = !modelValue.value
}
</script>
<style lang="scss" scoped>
.linked-document-card {
  &--collapse {
    height: 68px;
    overflow: hidden;
  }
  &__toggle {
    width: 3em;
  }
}
</style>
