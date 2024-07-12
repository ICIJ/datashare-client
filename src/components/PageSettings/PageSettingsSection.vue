<template>
  <page-settings-section-group :label="label" v-model="localOpen" class="page-settings-section">
    <component :is="formGroup"
               id="checkbox-group-1"
               class="page-settings-section__input-group"
               v-model="localValue"
               :name="name"
               stacked
    >
      <component :is="formInput" v-for="(option,index) in options" :key="index" :value="option.value" class="page-settings-section__input-group__input">
        <page-settings-entry :text="option.text" :icon="option.icon" />
      </component>
    </component>
  </page-settings-section-group>
</template>

<script setup>
import {computed} from "vue"
import PageSettingsEntry from "@/components/PageSettings/PageSettingsEntry.vue";
import PageSettingsSectionGroup from "@/components/PageSettings/PageSettingsSectionGroup.vue";
import {BFormCheckbox, BFormCheckboxGroup, BFormRadio, BFormRadioGroup} from "bootstrap-vue-next";
defineOptions({
  name:"PageSettingsSection"
})

const RADIO = "radio"
const CHECKBOX = "checkbox"
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
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
const open = defineModel('open',{
  type:Boolean,
  default: true,
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
    console.log("test",newVal)
    open.value = newVal
  }
})
</script>

<style lang="scss" scoped>
.page-settings{
  &-section{
    &__input-group{

    margin-left: 1em !important;
    }
    margin-bottom: 1em !important;
  }
}

</style>
