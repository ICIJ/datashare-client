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
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.anyOfTheseWords')"
          :icon="IPhUniteSquare"
        >
          <b-form-input
            ref="firstInput"
            v-model="form.anyWords"
          />
          <template #example>
            <p class="search-advanced-modal__example">
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.eg') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.anyOfTheseWordsExample') }}
              </span>
            </p>
          </template>
        </search-advanced-modal-field>

        <!-- All these words (AND) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.allTheseWords')"
          :icon="IPhIntersectSquare"
        >
          <b-form-input
            v-model="form.allWords"
          />
          <template #example>
            <p class="search-advanced-modal__example">
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.eg') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.allTheseWordsExample1') }}
              </span>
              <span class="search-advanced-modal__example__break" />
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.or') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.allTheseWordsExample2') }}
              </span>
            </p>
          </template>
        </search-advanced-modal-field>

        <!-- This exact word or phrase -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.exactPhrase')"
          :icon="IPhQuotes"
        >
          <b-form-input
            v-model="form.exactPhrase"
          />
          <template #example>
            <p class="search-advanced-modal__example">
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.eg') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.exactPhraseExample') }}
              </span>
            </p>
          </template>
        </search-advanced-modal-field>

        <!-- None of these words (NOT) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.noneOfTheseWords')"
          :icon="IPhTextStrikethrough"
        >
          <b-form-input
            v-model="form.noneWords"
          />
          <template #example>
            <p class="search-advanced-modal__example">
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.eg') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.noneOfTheseWordsExample1') }}
              </span>
              <span class="search-advanced-modal__example__break" />
              <span class="search-advanced-modal__example__prefix">
                {{ t('searchAdvancedModal.or') }}
              </span>
              <span class="search-advanced-modal__example__value">
                {{ t('searchAdvancedModal.noneOfTheseWordsExample2') }}
              </span>
            </p>
          </template>
        </search-advanced-modal-field>

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
              :min="0"
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
              :min="0"
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
import { ref, computed, nextTick, watch, useTemplateRef } from 'vue'
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
import IPhHash from '~icons/ph/hash'
import IPhFileText from '~icons/ph/file-text'
import IPhUserList from '~icons/ph/user-list'
import IPhUserSquare from '~icons/ph/user-square'
import IPhTextColumns from '~icons/ph/text-columns'
import IPhTreeStructure from '~icons/ph/tree-structure'
import IPhChatsTeardrop from '~icons/ph/chats-teardrop'

import AppModal from '@/components/AppModal/AppModal.vue'
import FormActions from '@/components/Form/FormActions/FormActions.vue'
import FormControlRange from '@/components/Form/FormControl/FormControlRange/FormControlRange.vue'
import SearchAdvancedModalField from './SearchAdvancedModalField.vue'
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

const isVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

function getInitialForm() {
  return {
    anyWords: '',
    allWords: '',
    exactPhrase: '',
    noneWords: '',
    singleWildcardStart: '',
    singleWildcardEnd: '',
    multiWildcardStart: '',
    multiWildcardEnd: '',
    fuzzyTerm: '',
    fuzzyDistance: 0,
    proximityPhrase: '',
    proximityDistance: 0,
    fieldAll: true,
    selectedFields: []
  }
}

const form = ref(getInitialForm())
// Bumped on Reset to remount inputs and force-clear any leftover internal
// state (e.g. native input selection, validation classes).
const formKey = ref(0)
const firstInput = useTemplateRef('firstInput')

/**
 * The form is considered empty when no input would contribute to a Lucene
 * query. The Search button stays disabled in that state to prevent a no-op
 * search.
 */
const isFormEmpty = computed(() => {
  const f = form.value
  return Object.values({
    anyWords: f.anyWords,
    allWords: f.allWords,
    exactPhrase: f.exactPhrase,
    noneWords: f.noneWords,
    singleWildcardStart: f.singleWildcardStart,
    singleWildcardEnd: f.singleWildcardEnd,
    multiWildcardStart: f.multiWildcardStart,
    multiWildcardEnd: f.multiWildcardEnd,
    fuzzyTerm: f.fuzzyTerm,
    proximityPhrase: f.proximityPhrase
  }).every(v => v.trim() === '')
})

// Autofocus the first tag input when the modal becomes visible so users can
// start typing right away (and screen readers announce the labelled field).
watch(isVisible, async (visible) => {
  if (!visible) return
  await nextTick()
  firstInput.value?.focus?.()
})

const fields = [
  { value: 'tags', label: 'searchAdvancedModal.fields.tags', icon: IPhHash },
  { value: 'path', label: 'searchAdvancedModal.fields.name', icon: IPhFileText },
  { value: 'contentAuthor', label: 'searchAdvancedModal.fields.author', icon: IPhUserList },
  { value: 'contentRecipient', label: 'searchAdvancedModal.fields.recipients', icon: IPhUserSquare },
  { value: 'content', label: 'searchAdvancedModal.fields.content', icon: IPhTextColumns },
  { value: 'dirname', label: 'searchAdvancedModal.fields.path', icon: IPhTreeStructure },
  { value: 'contentThreadId', label: 'searchAdvancedModal.fields.threadId', icon: IPhChatsTeardrop }
]

/**
 * "All fields" and individual field checkboxes are mutually exclusive:
 * - Selecting an individual field deselects "All".
 * - Deselecting the last individual field re-selects "All".
 * - Selecting "All" clears every individual field; it cannot be unticked
 *   directly (the user must pick an individual field to leave the "all"
 *   state), which avoids landing in an empty state.
 */
function handleFieldAllChange(checked) {
  if (checked) {
    form.value.selectedFields = []
  }
  else {
    // Prevent the user from unselecting "All" with no field selected.
    form.value.fieldAll = true
  }
}

function handleFieldChange() {
  form.value.fieldAll = form.value.selectedFields.length === 0
}

/**
 * Convert the form's string-typed fields into the array shape expected by
 * `useAdvancedSearchQuery.generateQuery` — words are split on whitespace,
 * the exact phrase is kept as a single entry.
 */
function toQueryShape(f) {
  const words = s => s.trim().split(/\s+/).filter(Boolean)
  return {
    ...f,
    anyWords: words(f.anyWords),
    allWords: words(f.allWords),
    noneWords: words(f.noneWords),
    exactPhrase: f.exactPhrase.trim() ? [f.exactPhrase.trim()] : []
  }
}

function handleSearch() {
  const query = generateQuery(toQueryShape(form.value))
  emit('search', query)
  isVisible.value = false
}

function handleReset() {
  form.value = getInitialForm()
  formKey.value += 1
}

// Expose form state and handlers so tests can drive the component without
// reaching into the rendered child components.
defineExpose({ form, isFormEmpty, handleSearch, handleReset })
</script>

<style lang="scss" scoped>
.search-advanced-modal {
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
  // below the input column starting at the same x-offset (245px label
  // column + 16px gap) to stay visually anchored under the input.
  &__slider {
    display: flex;
    align-items: flex-start;
    gap: $spacer;

    @include media-breakpoint-up(md) {
      padding-left: calc(245px + #{$spacer});
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
        padding-left: calc(245px + #{$spacer});
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
      padding-left: calc(245px + $spacer);
    }
  }
}
</style>

<style lang="scss">
// Global overrides for the modal teleported into <body>. We target
// `.modal-body:has(.search-advanced-modal)` rather than `.app-modal:has(...)`
// because BSV-Next does not always forward the `class` prop to the same
// wrapper across versions, so the `.modal-body` ancestor is the most
// reliable anchor.
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
