<template>
  <div
    class="linked-document-card d-flex row bg-tertiary rounded align-items-start"
    :class="{ 'linked-document-card--skrink': !modelValue }"
  >
    <div class="d-flex col-11 row-gap-3 column-gap-3 justify-content-between">
      <linked-document-section
        title="documents in the same folder"
        icon="files"
        description="Same extraction level as this document"
        :documents="siblings"
        class="col-12 col-sm-6 p-4"
      />
      <linked-document-section
        title="children documents"
        icon="paperclip"
        description="One extraction level below this document"
        :documents="children"
        class="col-12 col-sm-6 p-4"
      />
    </div>
    <span class="linked-document-card__toggle col-1 mt-2 btn btn-md" @click="toggle">
      <phosphor-icon :name="caretIcon" />
    </span>
  </div>
</template>

<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'

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
const caretIcon = computed(() => {
  return modelValue.value ? 'caret-up' : 'caret-down'
})
function toggle() {
  modelValue.value = !modelValue.value
}
</script>
<style lang="scss" scoped>
.linked-document-card {
  &--skrink {
    height: 70px;
    overflow: hidden;
  }
}
</style>
