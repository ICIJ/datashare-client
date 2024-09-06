<template>
  <page-settings-section-group v-model="localOpen" :label="label" class="page-settings-section">
    <component
      :is="formGroup"
      id="checkbox-group-1"
      v-model="localValue"
      class="page-settings-section__input-group ps-4 pb-4"
      stacked
    >
      <component
        :is="formInput"
        v-for="(option, index) in options"
        :key="index"
        :value="option.value"
        :name="name ?? defaultName"
        class="page-settings-section__input-group__input"
      >
        <page-settings-entry :text="option.text ?? option.value" :icon="option.icon" />
      </component>
    </component>
  </page-settings-section-group>
</template>

<script setup>
import { uniqueId } from 'lodash'
import { computed } from 'vue'
import { BFormCheckbox, BFormCheckboxGroup, BFormRadio, BFormRadioGroup } from 'bootstrap-vue-next'

import PageSettingsEntry from '@/components/PageSettings/PageSettingsEntry'
import PageSettingsSectionGroup from '@/components/PageSettings/PageSettingsSectionGroup'

defineOptions({
  name: 'PageSettingsSection'
})

const defaultName = uniqueId('page-settings-section-')

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
    type: String
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
    open.value = newVal
  }
})
</script>
