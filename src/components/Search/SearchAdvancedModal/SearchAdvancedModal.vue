<template>
  <app-modal
    v-model="isVisible"
    size="xl"
    :title="t('searchAdvancedModal.title')"
    :ok-title="t('searchAdvancedModal.search')"
    :cancel-title="t('searchAdvancedModal.cancel')"
    @ok="handleSearch"
  >
    <template #title>
      <span class="search-advanced-modal__title">
        {{ t('searchAdvancedModal.title') }}
        <i-ph-eyeglasses class="search-advanced-modal__title__icon" />
      </span>
    </template>

    <div class="search-advanced-modal">
      <!-- Form: wrapped in a real <form> so pressing Enter inside any input
           triggers the same submit handler as clicking the Search button. -->
      <form
        :key="formKey"
        class="search-advanced-modal__form"
        novalidate
        @submit.prevent="handleSearch"
      >
        <!-- Any of these words (OR) -->
        <search-advanced-modal-field-text
          ref="firstInput"
          v-model="form.anyWords"
          :label="t('searchAdvancedModal.anyOfTheseWords')"
          :icon="IPhUniteSquare"
          :examples="[t('searchAdvancedModal.anyOfTheseWordsExample')]"
        />

        <!-- All these words (AND) -->
        <search-advanced-modal-field-text
          v-model="form.allWords"
          :label="t('searchAdvancedModal.allTheseWords')"
          :icon="IPhIntersectSquare"
          :examples="[t('searchAdvancedModal.allTheseWordsExample')]"
        />

        <!-- This exact word or phrase -->
        <search-advanced-modal-field-text
          v-model="form.exactPhrase"
          :label="t('searchAdvancedModal.exactPhrase')"
          :icon="IPhQuotes"
          :examples="[t('searchAdvancedModal.exactPhraseExample')]"
        />

        <!-- None of these words (NOT) -->
        <search-advanced-modal-field-text
          v-model="form.noneWords"
          :label="t('searchAdvancedModal.noneOfTheseWords')"
          :icon="IPhTextStrikethrough"
          :examples="[
            t('searchAdvancedModal.noneOfTheseWordsExample1'),
            t('searchAdvancedModal.noneOfTheseWordsExample2')
          ]"
        />

        <!-- Any word with 1 character between (?) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.singleCharWildcard')"
          :icon="IPhQuestion"
        >
          <div class="d-flex align-items-center gap-2">
            <b-form-input
              v-model="form.singleWildcardStart"
            />
            <span class="text-secondary">
              {{ t('searchAdvancedModal.and') }}
            </span>
            <b-form-input
              v-model="form.singleWildcardEnd"
            />
          </div>
          <template #example>
            <p class="search-advanced-modal__example">
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.eg') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.singleCharWildcardExample') }}
              </span>
            </p>
          </template>
        </search-advanced-modal-field>

        <!-- Any word with multiple characters between (*) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.multiCharWildcard')"
          :icon="IPhAsterisk"
        >
          <div class="d-flex align-items-center gap-2">
            <b-form-input
              v-model="form.multiWildcardStart"
            />
            <span class="text-secondary">
              {{ t('searchAdvancedModal.and') }}
            </span>
            <b-form-input
              v-model="form.multiWildcardEnd"
            />
          </div>
          <template #example>
            <p class="search-advanced-modal__example">
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.eg') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.multiCharWildcardExample') }}
              </span>
            </p>
          </template>
        </search-advanced-modal-field>

        <!-- With spelling changes (Fuzzy) -->
        <div class="search-advanced-modal__field-group">
          <search-advanced-modal-field
            :label="t('searchAdvancedModal.fuzzySearch')"
            :icon="IPhTextAa"
          >
            <b-form-input
              v-model="form.fuzzyTerm"
            />
          </search-advanced-modal-field>
          <div class="search-advanced-modal__slider">
            <label class="search-advanced-modal__slider__label text-action">
              {{ t('searchAdvancedModal.charactersDifferent') }}
            </label>
            <form-control-range
              v-model="form.fuzzyDistance"
              :min="1"
              :max="2"
              :step="1"
            />
          </div>
          <p class="search-advanced-modal__example search-advanced-modal__example--offset">
            <span class="search-advanced-modal__example__prefix">
              {{ t('searchAdvancedModal.eg') }}
            </span>
            <span class="search-advanced-modal__example__value">
              {{ t('searchAdvancedModal.fuzzySearchExample') }}
            </span>
          </p>
          <div class="search-advanced-modal__explanation">
            <p class="mb-2">
              {{ t('searchAdvancedModal.fuzzySearchExplanation1') }}
            </p>
            <p class="mb-0">
              {{ t('searchAdvancedModal.fuzzySearchExplanation2') }}
            </p>
          </div>
        </div>

        <!-- With phrase changes (Proximity) -->
        <div class="search-advanced-modal__field-group">
          <search-advanced-modal-field
            :label="t('searchAdvancedModal.proximitySearch')"
            :icon="IPhArrowsOutLineHorizontal"
          >
            <b-form-input
              v-model="form.proximityPhrase"
            />
          </search-advanced-modal-field>
          <div class="search-advanced-modal__slider">
            <label class="search-advanced-modal__slider__label text-action">
              {{ t('searchAdvancedModal.maxWordsApart') }}
            </label>
            <form-control-range
              v-model="form.proximityDistance"
              :min="1"
              :max="6"
              :step="1"
            />
          </div>
          <p class="search-advanced-modal__example search-advanced-modal__example--offset">
            <span class="search-advanced-modal__example__prefix">
              {{ t('searchAdvancedModal.eg') }}
            </span>
            <span class="search-advanced-modal__example__value">
              {{ t('searchAdvancedModal.proximitySearchExample') }}
            </span>
          </p>
          <div class="search-advanced-modal__explanation">
            <p class="mb-2">
              {{ t('searchAdvancedModal.proximitySearchExplanation1') }}
            </p>
            <p class="mb-2">
              {{ t('searchAdvancedModal.proximitySearchExplanation2') }}
            </p>
            <p class="mb-2">
              {{ t('searchAdvancedModal.proximitySearchExplanation3') }}
            </p>
            <p class="mb-0">
              {{ t('searchAdvancedModal.proximitySearchExplanation4') }}
            </p>
          </div>
        </div>

        <!-- Search in specific fields -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.searchInFields')"
          :icon="IPhMagnifyingGlass"
          align-top
        >
          <div class="search-advanced-modal__field__checkboxes">
            <b-form-checkbox
              v-model="form.fieldAll"
              class="search-advanced-modal__field__checkboxes__all fw-medium"
              @change="handleFieldAllChange"
            >
              {{ t('searchAdvancedModal.allFields') }}
            </b-form-checkbox>
            <b-form-checkbox
              v-for="field in fields"
              :key="field.value"
              v-model="form.selectedFields"
              :value="field.value"
              class="search-advanced-modal__field__checkboxes__item"
              @change="handleFieldChange"
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
        <!-- Hidden submit so pressing Enter in any input triggers the form
             handler even when the focused control swallows the event. -->
        <button
          type="submit"
          class="visually-hidden"
          tabindex="-1"
          aria-hidden="true"
        >
          {{ t('searchAdvancedModal.search') }}
        </button>
      </form>
    </div>

    <template #footer="{ cancel, ok }">
      <form-actions end>
        <button-icon
          variant="outline-secondary"
          @click="cancel"
        >
          {{ t('searchAdvancedModal.cancel') }}
        </button-icon>
        <button-icon
          variant="outline-secondary"
          @click="handleReset"
        >
          {{ t('searchAdvancedModal.reset') }}
        </button-icon>
        <button-icon
          variant="action"
          :disabled="isFormEmpty"
          @click="ok"
        >
          {{ t('searchAdvancedModal.search') }}
        </button-icon>
      </form-actions>
    </template>
  </app-modal>
</template>

<script setup>
import { computed, nextTick, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon, ButtonIcon } from '@icij/murmur-next'
import IPhUniteSquare from '~icons/ph/unite-square'
import IPhIntersectSquare from '~icons/ph/intersect-square'
import IPhQuotes from '~icons/ph/quotes'
import IPhTextStrikethrough from '~icons/ph/text-strikethrough'
import IPhQuestion from '~icons/ph/question'
import IPhAsterisk from '~icons/ph/asterisk'
import IPhTextAa from '~icons/ph/text-aa'
import IPhArrowsOutLineHorizontal from '~icons/ph/arrows-out-line-horizontal'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

import AppModal from '@/components/AppModal/AppModal.vue'
import FormActions from '@/components/Form/FormActions/FormActions.vue'
import FormControlRange from '@/components/Form/FormControl/FormControlRange/FormControlRange.vue'
import SearchAdvancedModalField from './SearchAdvancedModalField.vue'
import SearchAdvancedModalFieldText from './SearchAdvancedModalFieldText.vue'
import { useAdvancedSearchForm } from '@/composables/useAdvancedSearchForm'
import { useAdvancedSearchQuery } from '@/composables/useAdvancedSearchQuery'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const { t } = useI18n()
const { generateQuery } = useAdvancedSearchQuery()
const {
  form,
  formKey,
  fields,
  isFormEmpty,
  handleFieldAllChange,
  handleFieldChange,
  reset: handleReset,
  toQueryShape
} = useAdvancedSearchForm()

const isVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const firstInput = useTemplateRef('firstInput')

// Reset the form on close so reopening always starts from a clean state
// (cancel / ESC / backdrop / successful search all share this code path).
// Autofocus the first input on open so users can start typing right away
// and screen readers announce the labelled field.
watch(isVisible, async (visible) => {
  if (!visible) {
    handleReset()
    return
  }
  await nextTick()
  firstInput.value?.focus?.()
})

function handleSearch() {
  // Pressing Enter inside an input also submits the form, so guard here
  // rather than relying on the visible Search button being disabled.
  if (isFormEmpty.value) return
  const query = generateQuery(toQueryShape(form.value))
  emit('search', query)
  isVisible.value = false
}

// Expose form state and handlers so tests can drive the component without
// reaching into the rendered child components.
defineExpose({ form, isFormEmpty, handleSearch, handleReset })
</script>

<style lang="scss" scoped>
.search-advanced-modal {
  // Width of the label column shared with SearchAdvancedModalField. Exposed as
  // a CSS custom property so the field component (and offset blocks below)
  // can read the same value without re-declaring it.
  --search-advanced-modal-label-col: 245px;

  display: flex;
  flex-direction: column;
  gap: $spacer * 2;

  &__title {
    display: inline-flex;
    align-items: center;
    gap: $spacer * 0.5;

    &__icon {
      color: var(--bs-secondary-color);
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacer * 1.5;
  }

  &__field-group {
    display: flex;
    flex-direction: column;
    gap: $spacer * 0.5;
  }

  // Slider rows live outside SearchAdvancedModalField so their label aligns
  // with the slider track itself instead of the form-input above. They sit
  // below the input column starting at the same x-offset (label column +
  // gap) to stay visually anchored under the input.
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
      // The track sits at `padding-top: $spacer-xs` inside the range
      // wrapper; offsetting the label by the same amount keeps both on the
      // same horizontal baseline without restyling the DS component.
      padding-top: $spacer-xs;
    }
  }

  &__example {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: $spacer;
    row-gap: 2px;
    margin: 0;
    font-size: $small-font-size;
    line-height: $line-height-sm;

    &__prefix {
      color: var(--bs-secondary-color);
    }

    &__value {
      color: var(--bs-body-color);
    }

    &__break {
      flex-basis: 100%;
      height: 0;
    }

    // Offset variant aligns the example block with the slider column
    // (label + gap) when it lives outside SearchAdvancedModalField.
    &--offset {
      @include media-breakpoint-up(md) {
        padding-left: calc(var(--search-advanced-modal-label-col) + #{$spacer});
      }
    }
  }

  &__field__checkboxes {
    display: flex;
    flex-direction: column;
    gap: $spacer * 0.25;

    :deep(.form-check) {
      margin: 0;
      padding-left: 1.75rem;
    }

    &__item__icon {
      flex-shrink: 0;
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
  }
}
</style>

<style lang="scss">
// Global overrides for the modal teleported into <body>. We target
// `.modal-dialog:has(.search-advanced-modal)` rather than `.app-modal:has(...)`
// because BSV-Next does not always forward the `class` prop to the same
// wrapper across versions, so the `.modal-dialog` ancestor is the most
// reliable anchor.
//
// `:has()` is supported across the project's browser matrix (Chrome 105+,
// Safari 15.4+, Firefox 121+ — see package.json `browserslist`). If that
// list ever loosens to older Firefox releases, fall back to a class-based
// hook on `.modal-dialog`.
//
// — make the dialog wider than the default xl size (1140px) without
//   horizontal scroll;
// — keep header and footer opaque while body scrolls;
// — left-align the modal title instead of the centered DS default.
.modal-dialog:has(.search-advanced-modal) {
  &.modal-xl {
    max-width: min(1400px, calc(100vw - 2 * #{$modal-dialog-margin}));
  }

  .modal-content {
    max-height: calc(100vh - 2 * #{$modal-dialog-margin});
  }

  .modal-body {
    overflow-y: auto;
    // Just enough top padding to keep the focus ring of the first input
    // from being clipped by the body's scrollable boundary.
    padding-top: $spacer-xs;
  }

  .modal-header + .modal-body {
    padding-top: $spacer-xs;
  }

  .modal-header {
    padding-bottom: $spacer * 0.5;
  }

  .modal-header,
  .modal-footer {
    background-color: var(--bs-modal-bg);
    z-index: 1;
  }

  .app-modal-header {
    text-align: start;
    align-items: flex-start;

    &__title {
      text-align: start;
    }
  }

}
</style>
