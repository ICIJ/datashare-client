<template>
    <component :is="formGroup"
               id="checkbox-group-1"
               v-model="localValue"
               :name="name"
               stacked
    >
      <component :is="formInput" v-for="(option,index) in options" :key="index" :value="option.value">
        <page-settings-entry :text="option.text" :icon="option.icon" />
      </component>
    </component>
</template>

<script setup>
import {computed, ref} from "vue";
import {PhosphorIcon} from "@icij/murmur-next";
import PageSettingsEntry from "@/components/PageSettingsEntry.vue";
import {BFormCheckbox, BFormCheckboxGroup, BFormRadio, BFormRadioGroup} from "bootstrap-vue-next";
defineOptions({
  name:"PageSettingsSection"
})

const RADIO = "radio"
const CHECKBOX = "checkbox"
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (inputType) => [RADIO, CHECKBOX].includes(inputType)
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
  default: () => [],
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
</script>

