<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  modelValue: {
    type: Boolean
  }
})
const { t } = useI18n()
</script>

<template>
  <div class="document-card-checkbox">
    <b-form-checkbox
      :aria-label="t('documentCardCheckbox.selectDocument')"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <span class="visually-hidden">{{ t('documentCardCheckbox.selectDocument') }}</span>
    </b-form-checkbox>
  </div>
</template>

<style lang="scss" scoped>
.document-card-checkbox {
  display: inline-flex;

  &:deep(.form-check) {
    display: block;
    position: relative;
    padding: 0;
    margin: 0;

    .form-check-input {
      margin: $spacer-xxs auto $spacer;
      float: none;
    }

    .form-check-label {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
