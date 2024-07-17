<template>
  <page-settings-section-group v-model="localOpen" :label="label" class="page-settings-section">
    <component
      :is="formGroup"
      id="checkbox-group-1"
      v-model="localValue"
      class="page-settings-section__input-group"
      :name="name"
      stacked
    >
      <component
        :is="formInput"
        v-for="(option, index) in options"
        :key="index"
        :value="option.value"
        class="page-settings-section__input-group__input"
      >
        <page-settings-entry :text="option.text" :icon="option.icon" />
      </component>
    </component>
  </page-settings-section-group>
</template>

<script setup>
import { computed } from 'vue'
import { BFormCheckbox, BFormCheckboxGroup, BFormRadio, BFormRadioGroup } from 'bootstrap-vue-next'

import PageSettingsEntry from '@/components/PageSettings/PageSettingsEntry'
import PageSettingsSectionGroup from '@/components/PageSettings/PageSettingsSectionGroup'
defineOptions({
  name: 'PageSettingsSection'
})

const RADIO = 'radio'
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (inputType) => ['radio', 'checkbox'].includes(inputType)
  },
  name: {
    type: String,
    default: 'settings'
  },
  options: {
    type: Object,
    required: true
  }
})
const modelValue = defineModel({
  type: [String, Array],
  default: () => []
})
const open = defineModel('open', {
  type: Boolean,
  default: true
})
const formGroup = computed(() => {
  return props.type === RADIO ? BFormRadioGroup : BFormCheckboxGroup
})
const formInput = computed(() => {
  return props.type === RADIO ? BFormRadio : BFormCheckbox
})
const localValue = computed({
  get: () => modelValue.value,
  set: (newVal) => {
    modelValue.value = newVal
  }
})
const localOpen = computed({
  get: () => open.value,
  set: (newVal) => {
    console.log('test', newVal)
    open.value = newVal
  }
})
</script>

<style lang="scss" scoped>
.page-settings-section {
  margin-bottom: 1em !important;

  &__input-group {
    margin-left: 1em !important;
  }
}
</style>
