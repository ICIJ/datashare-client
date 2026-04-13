<script setup>
import DismissableAlert from '@/components/Dismissable/DismissableAlert.vue'
import DismissableInputEditable from '@/components/Dismissable/DismissableInputEditable.vue'
import VariantDropdown from '@/components/VariantDropdown/VariantDropdown.vue'

const modelValue = defineModel({ type: String })
const variant = defineModel('variant', { type: String, default: 'info' })

defineProps({
  placeholder: { type: String },
})
</script>

<template>
  <div class="dismissable-alert-editable">
    <dismissable-alert
      :variant="variant"
      no-button
      no-close
      class="mb-0"
      content-class="flex-grow-1"
    >
      <template #icon>
        <variant-dropdown v-model="variant" />
      </template>
      <template #default>
        <dismissable-input-editable
          v-model="modelValue"
          :placeholder="placeholder"
        />
      </template>
    </dismissable-alert>
  </div>
</template>

<style scoped lang="scss">
.dismissable-alert-editable {
  :deep(.alert-body) {
    flex-basis: 100%;
  }
}
</style>
