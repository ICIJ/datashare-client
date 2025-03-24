<script setup>
import { uniqueId } from 'lodash'
import { computed } from 'vue'
import { BFormCheckbox, BFormCheckboxGroup, BFormRadio, BFormRadioGroup } from 'bootstrap-vue-next'

import PageSettingsEntry from '@/components/PageSettings/PageSettingsEntry'
import PageSettingsSectionGroup from '@/components/PageSettings/PageSettingsSectionGroup'
import PageSettingsSectionGroupAll from '@/components/PageSettings/PageSettingsSectionGroupAll'
import { INPUT_RADIO, INPUT_CHECKBOX } from '@/composables/useViewSettings'

defineOptions({ name: 'PageSettingsSection' })

const defaultName = uniqueId('page-settings-section-')

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => [INPUT_RADIO, INPUT_CHECKBOX].includes(value)
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
  type: [String, Number, Boolean, Array],
  default: () => []
})

const open = defineModel('open', {
  type: Boolean,
  default: true
})

const isRadio = computed(() => props.type === INPUT_RADIO)
const isCheckbox = computed(() => props.type === INPUT_CHECKBOX)

const formGroup = computed(() => (isRadio.value ? BFormRadioGroup : BFormCheckboxGroup))
const formInput = computed(() => (isRadio.value ? BFormRadio : BFormCheckbox))
</script>

<template>
  <page-settings-section-group v-model="open" :label="label" class="page-settings-section">
    <div v-if="isCheckbox" class="page-settings-section__input-group">
      <page-settings-section-group-all v-model="modelValue" :options="options" />
    </div>
    <component
      :is="formGroup"
      id="checkbox-group-1"
      v-model="modelValue"
      class="page-settings-section__input-group"
      stacked
    >
      <component
        :is="formInput"
        v-for="(option, index) in options"
        :key="index"
        :value="option.value"
        :disabled="option.disabled"
        :name="name ?? defaultName"
      >
        <page-settings-entry :text="option.text ?? String(option.value)" :icon="option.icon" />
      </component>
    </component>
  </page-settings-section-group>
</template>

<style lang="scss" scoped>
.page-settings-section {
  padding-bottom: $spacer-lg;

  &__input-group {
    padding-left: $spacer-lg;
  }
}
</style>
