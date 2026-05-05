<template>
  <search-advanced-modal-field
    :label="t('searchAdvancedModal.searchInFields')"
    :icon="IPhMagnifyingGlass"
    align-top
  >
    <div class="search-advanced-modal__field__checkboxes">
      <b-form-checkbox
        :model-value="all"
        class="search-advanced-modal__field__checkboxes__all fw-medium"
        @update:model-value="$emit('update:all', $event)"
      >
        {{ t('searchAdvancedModal.allFields') }}
      </b-form-checkbox>
      <b-form-checkbox
        v-for="field in fields"
        :key="field.value"
        :model-value="selected"
        :value="field.value"
        class="search-advanced-modal__field__checkboxes__item"
        @update:model-value="$emit('update:selected', $event)"
      >
        <span class="d-inline-flex align-items-center gap-2 text-secondary">
          <app-icon class="search-advanced-modal__field__checkboxes__item__icon">
            <component :is="field.icon" />
          </app-icon>
          {{ t(field.label) }}
        </span>
      </b-form-checkbox>
    </div>
  </search-advanced-modal-field>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur-next'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

import SearchAdvancedModalField from './SearchAdvancedModalField.vue'

defineProps({
  /**
   * Whether the "All fields" master checkbox is ticked. Mutually
   * exclusive with `selected` — the parent enforces the rule.
   */
  all: {
    type: Boolean,
    default: true
  },
  /**
   * Currently selected individual field values (subset of `fields`
   * value strings).
   */
  selected: {
    type: Array,
    default: () => []
  },
  /**
   * Field options to render. Each entry is `{ value, label, icon }`
   * where `value` is the ES field path emitted in the query.
   */
  fields: {
    type: Array,
    required: true
  }
})

defineEmits(['update:all', 'update:selected'])

const { t } = useI18n()
</script>
