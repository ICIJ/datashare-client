<script setup>
import SettingsAppearanceTheme from '@/components/Settings/SettingsAppearance/SettingsAppearanceTheme'

const modelValue = defineModel({ type: String, required: true })

defineProps({
  options: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <b-form-group v-slot="{ ariaDescribedby }" class="settings-appearance-radio-group m-auto">
    <b-form-radio-group
      id="radio-group-theme"
      v-model="modelValue"
      class="settings-appearance-radio-group__radio-group d-flex flex-column gap-1"
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
        <settings-appearance-theme v-bind="option" />
      </b-form-radio>
    </b-form-radio-group>
  </b-form-group>
</template>

<style lang="scss">
.settings-appearance-radio-group {
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
