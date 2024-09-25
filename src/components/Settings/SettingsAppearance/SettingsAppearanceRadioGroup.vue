<script setup>
import { ref } from 'vue'

import SettingsAppearanceTheme from '@/components/Settings/SettingsAppearance/SettingsAppearanceTheme'
defineModel({type: String, required: true})
defineProps({
  options: { type: Array, required: true }
})

const selected = ref('light')
</script>

<template>
  <b-form-group v-slot="{ ariaDescribedby }" class="settings-appearance-radio-group col-12 col-md-4 offset-md-4">
    <b-form-radio-group
      id="radio-group-theme"
      :modelValue="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      class="settings-appearance-radio-group__radio-group"
      :aria-describedby="ariaDescribedby"
      name="radio-options"
      stacked
    >
      <b-form-radio
        v-for="option in options"
        :key="option.label"
        :value="option.name"
        :aria-describedby="ariaDescribedby"
        :name="option.name"
      >
        <settings-appearance-theme v-bind="option" :active="selected === option.name" />
      </b-form-radio>
    </b-form-radio-group>
  </b-form-group>
</template>

<style lang="scss">
.settings-appearance-radio-group {
  &__radio-group {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  & .form-check {
    display: flex;
    align-items: center;

    & .form-check-input {
      margin-top: 0;
    }
    & .form-check-label {
      display: flex;
      flex-grow: 1;
    }
  }
}
</style>
