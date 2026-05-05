<template>
  <div class="search-advanced-modal__field-group">
    <search-advanced-modal-field
      :label="label"
      :icon="icon"
    >
      <b-form-input
        :model-value="term"
        @update:model-value="$emit('update:term', $event)"
      />
    </search-advanced-modal-field>
    <div class="search-advanced-modal__slider">
      <label class="search-advanced-modal__slider__label text-action">
        {{ rangeLabel }}
      </label>
      <form-control-range
        :model-value="distance"
        :min="min"
        :max="max"
        :step="1"
        @update:model-value="$emit('update:distance', $event)"
      />
    </div>
    <p class="search-advanced-modal__example search-advanced-modal__example--offset">
      <span class="search-advanced-modal__example__prefix">
        {{ t('searchAdvancedModal.eg') }}
      </span>
      <span class="search-advanced-modal__example__value">
        {{ example }}
      </span>
    </p>
    <div class="search-advanced-modal__explanation">
      <p
        v-for="(line, index) in explanations"
        :key="index"
        :class="index === explanations.length - 1 ? 'mb-0' : 'mb-2'"
      >
        {{ line }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import FormControlRange from '@/components/Form/FormControl/FormControlRange/FormControlRange.vue'
import SearchAdvancedModalField from './SearchAdvancedModalField.vue'

defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function],
    required: true
  },
  rangeLabel: {
    type: String,
    required: true
  },
  term: {
    type: String,
    default: ''
  },
  distance: {
    type: Number,
    default: 1
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    required: true
  },
  example: {
    type: String,
    required: true
  },
  /**
   * Lines shown under the slider explaining what the feature does.
   * Rendered as paragraphs separated by `mb-2`, with `mb-0` on the
   * last entry.
   */
  explanations: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:term', 'update:distance'])

const { t } = useI18n()
</script>
