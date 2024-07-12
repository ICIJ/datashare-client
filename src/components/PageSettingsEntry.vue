<template>
  <component :is="formInputType" :value="value" v-model="localValue">
    <slot>
      <span class="page-settings-entry"><phosphor-icon v-if="icon" :name="icon"/>{{ text }}</span>
    </slot>
  </component>
</template>

<script setup>
import {PhosphorIcon} from "@icij/murmur-next";
import {computed, inject} from "vue";
import {BFormCheckbox, BFormRadio} from "bootstrap-vue-next";
const RADIO = "radio"
const CHECKBOX = "checkbox"
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: false
  },
  type: {
    type: String,
    required:true,
    validator:(inputType) => [RADIO, CHECKBOX].includes(inputType)
  },
  icon: {
    type: String,
  },
  text: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: false
  }
})
const emits = defineEmits(["update:modelValue"])
const formInputType = computed(()=>{return props.type === RADIO? BFormRadio:BFormCheckbox})
const modelValue = defineModel({
  default: undefined,
})
const localValue = computed({
  get: () => modelValue.value,
  set: (newVal) => {
    modelValue.value = newVal
  }
})

</script>

<style lang="scss">
:checked + label {
  font-weight: 700;
}
</style>
