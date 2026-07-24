<template>
  <search-advanced-modal-field
    :label="t('searchAdvancedModal.searchInFields')"
    :icon="IPhMagnifyingGlass"
    align-top
  >
    <b-form-radio-group
      :model-value="field"
      class="search-advanced-modal__field__radios"
      name="advanced-search-field"
      stacked
      @update:model-value="$emit('update:field', $event)"
    >
      <b-form-radio
        v-for="option in fields"
        :key="option.value"
        :value="option.value"
        class="search-advanced-modal__field__radios__item"
      >
        {{ t(option.label) }}
      </b-form-radio>
    </b-form-radio-group>
  </search-advanced-modal-field>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

import SearchAdvancedModalField from './SearchAdvancedModalField.vue'

defineProps({
  /**
   * Currently selected field key (one of `fields` value strings). `'all'`
   * means an unscoped search.
   */
  field: {
    type: String,
    default: 'all'
  },
  /**
   * Field options to render. Each entry is `{ value, label }` where `value`
   * is a search store `field` key and `label` an i18n key.
   */
  fields: {
    type: Array,
    required: true
  }
})

defineEmits(['update:field'])

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.search-advanced-modal__field__radios {
  display: flex;
  flex-direction: column;
  gap: $spacer * 0.25;

  :deep(.form-check) {
    margin: 0;
    padding-left: 1.75rem;
  }
}
</style>
