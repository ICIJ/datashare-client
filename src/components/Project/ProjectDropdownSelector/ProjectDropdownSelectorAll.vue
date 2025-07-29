<script setup>
import { useI18n } from 'vue-i18n'

import ProjectDropdownSelectorCheckbox from './ProjectDropdownSelectorCheckbox'

const modelValue = defineModel('modelValue', { type: Boolean })
const { t } = useI18n()
</script>

<template>
  <li class="project-dropdown-selector-all">
    <project-dropdown-selector-checkbox v-model="modelValue">
      {{ t('projectDropdownSelectorAll.label') }}
    </project-dropdown-selector-checkbox>
  </li>
</template>

<style lang="scss" scoped>
.project-dropdown-selector-all {
  display: flex;

  &:deep(.project-dropdown-selector-checkbox) {
    flex: 1;
    border-radius: var(--bs-border-radius);

    &:hover {
      background: var(--bs-dropdown-link-hover-bg);
      color: var(--bs-dropdown-link-hover-color);
    }

    .form-check {
      flex: 1;

      .form-check-label {
        padding-block: $spacer-xs;
      }
    }
  }
}
</style>
