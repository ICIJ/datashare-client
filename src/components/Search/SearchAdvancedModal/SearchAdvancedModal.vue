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
        <search-advanced-modal-field-wildcard
          :start="form.singleWildcardStart"
          :end="form.singleWildcardEnd"
          :label="t('searchAdvancedModal.singleCharWildcard')"
          :icon="IPhQuestion"
          :example="t('searchAdvancedModal.singleCharWildcardExample')"
          @update:start="form.singleWildcardStart = $event"
          @update:end="form.singleWildcardEnd = $event"
        />

        <!-- Any word with multiple characters between (*) -->
        <search-advanced-modal-field-wildcard
          :start="form.multiWildcardStart"
          :end="form.multiWildcardEnd"
          :label="t('searchAdvancedModal.multiCharWildcard')"
          :icon="IPhAsterisk"
          :example="t('searchAdvancedModal.multiCharWildcardExample')"
          @update:start="form.multiWildcardStart = $event"
          @update:end="form.multiWildcardEnd = $event"
        />

        <!-- With spelling changes (Fuzzy) -->
        <search-advanced-modal-field-range
          :term="form.fuzzyTerm"
          :distance="form.fuzzyDistance"
          :max="2"
          :label="t('searchAdvancedModal.fuzzySearch')"
          :icon="IPhTextAa"
          :range-label="t('searchAdvancedModal.charactersDifferent')"
          :example="t('searchAdvancedModal.fuzzySearchExample')"
          :explanations="[
            t('searchAdvancedModal.fuzzySearchExplanation1'),
            t('searchAdvancedModal.fuzzySearchExplanation2')
          ]"
          @update:term="form.fuzzyTerm = $event"
          @update:distance="form.fuzzyDistance = $event"
        />

        <!-- With phrase changes (Proximity) -->
        <search-advanced-modal-field-range
          :term="form.proximityPhrase"
          :distance="form.proximityDistance"
          :max="6"
          :label="t('searchAdvancedModal.proximitySearch')"
          :icon="IPhArrowsOutLineHorizontal"
          :range-label="t('searchAdvancedModal.maxWordsApart')"
          :example="t('searchAdvancedModal.proximitySearchExample')"
          :explanations="[
            t('searchAdvancedModal.proximitySearchExplanation1'),
            t('searchAdvancedModal.proximitySearchExplanation2'),
            t('searchAdvancedModal.proximitySearchExplanation3'),
            t('searchAdvancedModal.proximitySearchExplanation4')
          ]"
          @update:term="form.proximityPhrase = $event"
          @update:distance="form.proximityDistance = $event"
        />

        <!-- Search in specific fields -->
        <search-advanced-modal-fields-select
          :all="form.fieldAll"
          :selected="form.selectedFields"
          :fields="fields"
          @update:all="(value) => {
            form.fieldAll = value
            handleFieldAllChange(value)
          }"
          @update:selected="(value) => {
            form.selectedFields = value
            handleFieldChange()
          }"
        />
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
      <search-advanced-modal-footer
        :search-disabled="isFormEmpty"
        @cancel="cancel"
        @reset="handleReset"
        @search="ok"
      />
    </template>
  </app-modal>
</template>

<script setup>
import { computed, nextTick, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import IPhUniteSquare from '~icons/ph/unite-square'
import IPhIntersectSquare from '~icons/ph/intersect-square'
import IPhQuotes from '~icons/ph/quotes'
import IPhTextStrikethrough from '~icons/ph/text-strikethrough'
import IPhQuestion from '~icons/ph/question'
import IPhAsterisk from '~icons/ph/asterisk'
import IPhTextAa from '~icons/ph/text-aa'
import IPhArrowsOutLineHorizontal from '~icons/ph/arrows-out-line-horizontal'

import AppModal from '@/components/AppModal/AppModal.vue'
import SearchAdvancedModalFieldRange from './SearchAdvancedModalFieldRange.vue'
import SearchAdvancedModalFieldText from './SearchAdvancedModalFieldText.vue'
import SearchAdvancedModalFieldWildcard from './SearchAdvancedModalFieldWildcard.vue'
import SearchAdvancedModalFieldsSelect from './SearchAdvancedModalFieldsSelect.vue'
import SearchAdvancedModalFooter from './SearchAdvancedModalFooter.vue'
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

<style lang="scss">
// Not scoped: the shared example styles below (used by the FieldText,
// FieldWildcard, and FieldRange atoms) are applied inside child component
// templates that would not inherit a Vue scoped data-attribute from this
// SFC. The .search-advanced-modal BEM prefix prevents global leakage.
.search-advanced-modal {
  // Width of the label column shared with SearchAdvancedModalField and
  // every offset block below. Exposed as a custom property so atoms can
  // read it through the cascade without re-declaring the value.
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

  // The "e.g." block under each input. Shared across the three field
  // atoms (FieldText, FieldWildcard, FieldRange) so it lives here rather
  // than being duplicated three ways.
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
    // (label + gap) when it lives outside SearchAdvancedModalField — used
    // by the FieldRange atom, which renders its example outside the
    // labelled field grid.
    &--offset {
      @include media-breakpoint-up(md) {
        padding-left: calc(var(--search-advanced-modal-label-col) + #{$spacer});
      }
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
