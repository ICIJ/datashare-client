<template>
  <div class="search-advanced-modal-field-range">
    <search-advanced-modal-field
      :label="label"
      :icon="icon"
    >
      <b-form-input v-model="term" />
    </search-advanced-modal-field>
    <div class="search-advanced-modal-field-range__slider">
      <label class="search-advanced-modal-field-range__slider__label text-action">
        {{ rangeLabel }}
      </label>
      <form-control-range
        v-model="distance"
        :min="min"
        :max="max"
        :step="1"
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
    <div class="search-advanced-modal-field-range__explanation">
      <p
        v-for="(line, index) in explanations"
        :key="index"
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

const term = defineModel('term', { type: String, default: '' })
const distance = defineModel('distance', { type: Number, default: 1 })

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.search-advanced-modal-field-range {
  display: flex;
  flex-direction: column;
  gap: $spacer * 0.5;

  // Slider row lives outside SearchAdvancedModalField so its label aligns
  // with the slider track instead of the form-input above. Sits below the
  // input column starting at the same x-offset (label column + gap) to
  // stay visually anchored under the input.
  &__slider {
    display: flex;
    align-items: flex-start;
    gap: $spacer;

    @include media-breakpoint-up(md) {
      padding-left: calc(var(--search-advanced-modal-label-col) + #{$spacer});
    }

    &__label {
      // Vertically aligned with the slider track (top of the FormControlRange
      // wrapper) rather than centered with the ticks below.
      margin: 0;
      white-space: nowrap;
      // The track sits at `padding-top: $spacer-xs` inside the range wrapper;
      // offsetting the label by the same amount keeps both on the same
      // horizontal baseline without restyling the DS component.
      padding-top: $spacer-xs;
    }
  }

  &__explanation {
    font-size: $small-font-size;
    line-height: $line-height-sm;
    color: var(--bs-secondary-color);
    // Visually separate the explanation from the inline example above it.
    margin-top: $spacer;

    @include media-breakpoint-up(md) {
      padding-left: calc(var(--search-advanced-modal-label-col) + #{$spacer});
    }

    p {
      margin-bottom: $spacer * 0.5;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
