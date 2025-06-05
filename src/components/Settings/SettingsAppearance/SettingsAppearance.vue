<script setup>
import SettingsAppearanceOption from '@/components/Settings/SettingsAppearance/SettingsAppearanceOption'

const modelValue = defineModel({ type: String, required: true })

defineProps({
  options: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <b-form-group v-slot="{ ariaDescribedby }" class="settings-appearance m-auto">
    <b-form-radio-group
      id="radio-group-theme"
      v-model="modelValue"
      class="settings-appearance__radio-group d-flex flex-column gap-1"
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
        <settings-appearance-option v-bind="option" class="flex-grow-1" />
      </b-form-radio>
    </b-form-radio-group>
  </b-form-group>
</template>

<style lang="scss">
.settings-appearance {
  min-width: 350px;
  max-width: 400px;

  & .form-check {
    display: flex;
    align-items: center;

    & .form-check-input {
      margin-top: 0;
    }

    & .form-check-label {
      display: flex;
      flex-grow: 1;
      & img {
        height: 95px;
      }
    }
  }
}
</style>
