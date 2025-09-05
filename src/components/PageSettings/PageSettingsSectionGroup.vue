<template>
  <b-form-group class="page-settings-group">
    <template #label>
      <div
        class="page-settings-group__label d-flex"
        aria-controls="page-settings-group-collapse"
        :aria-expanded="modelValue ? 'true' : 'false'"
        @click="toggleSection"
      >
        <phosphor-icon
          class="d-inline-flex me-2"
          :name="caretIcon"
        />{{ label }}
      </div>
    </template>
    <b-collapse
      id="page-settings-group-collapse"
      v-model="modelValue"
    >
      <slot v-bind="{ open: modelValue }" />
    </b-collapse>
  </b-form-group>
</template>

<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhCaretUp, PhCaretDown } from '@phosphor-icons/vue'

defineOptions({
  name: 'PageSettingsSectionGroup'
})

defineProps({
  label: {
    type: String,
    default: 'Settings'
  }
})

const modelValue = defineModel({
  type: Boolean,
  default: true
})

const caretIcon = computed(() => (modelValue.value ? PhCaretUp : PhCaretDown))

function toggleSection() {
  modelValue.value = !modelValue.value
}
</script>

<style lang="scss" scoped>
.page-settings-group {
  &__label {
    cursor: pointer;
  }

  &:deep(.form-check) {
    line-height: 1.5em;
    min-height: 1.5em;
    vertical-align: baseline;
  }
}
</style>
