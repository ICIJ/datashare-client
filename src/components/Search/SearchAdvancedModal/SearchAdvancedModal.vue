<template>
  <app-modal
    v-model="isVisible"
    size="xl"
    :title="t('searchAdvancedModal.title')"
    :ok-title="t('searchAdvancedModal.search')"
    :cancel-title="t('searchAdvancedModal.cancel')"
    @ok="handleSearch"
  >
    <template #header>
      <app-modal-header
        :title="t('searchAdvancedModal.title')"
        no-header-close
        @close="isVisible = false"
      >
        <template #title>
          <div class="d-flex align-items-center gap-3">
            <h5 class="mb-0 fw-bold">{{ t('searchAdvancedModal.title') }}</h5>
            <PhEyeglasses :size="24" weight="regular" class="text-secondary" />
          </div>
        </template>
      </app-modal-header>
    </template>

    <div class="search-advanced-modal">
      <!-- Dismissable Alert -->
      <b-alert
        v-if="showAlert"
        variant="info"
        dismissible
        class="search-advanced-modal__alert d-flex align-items-center justify-content-between"
        @dismissed="showAlert = false"
      >
        <div class="d-flex align-items-center gap-3">
          <PhSmiley :size="20" weight="bold" />
          <span>{{ t('searchAdvancedModal.alertMessage') }}</span>
        </div>
        <b-button variant="outline-info" size="sm" @click="handleDismissAlert">
          {{ t('searchAdvancedModal.alertButton') }}
        </b-button>
      </b-alert>

      <!-- Form -->
      <div class="search-advanced-modal__form">
        <!-- Any of these words (OR) -->
        <div class="search-advanced-modal__field">
          <div class="search-advanced-modal__field__label">
            <PhSquare :size="20" class="text-secondary" />
            <span class="text-secondary">{{ t('searchAdvancedModal.anyOfTheseWords') }}</span>
          </div>
          <div class="search-advanced-modal__field__input">
            <search-advanced-modal-tag-input
              v-model="form.anyWords"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <p class="search-advanced-modal__field__example">
              {{ t('searchAdvancedModal.anyOfTheseWordsExample') }}
            </p>
          </div>
        </div>

        <!-- All these words (AND) -->
        <div class="search-advanced-modal__field">
          <div class="search-advanced-modal__field__label">
            <PhSquare :size="20" class="text-secondary" />
            <span class="text-secondary">{{ t('searchAdvancedModal.allTheseWords') }}</span>
          </div>
          <div class="search-advanced-modal__field__input">
            <search-advanced-modal-tag-input
              v-model="form.allWords"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <div class="d-flex gap-3 text-secondary">
              <p class="fst-italic mb-0">{{ t('searchAdvancedModal.allTheseWordsExample1') }}</p>
              <p class="mb-0">{{ t('searchAdvancedModal.or') }}</p>
              <p class="fst-italic mb-0">{{ t('searchAdvancedModal.allTheseWordsExample2') }}</p>
            </div>
          </div>
        </div>

        <!-- This exact word or phrase -->
        <div class="search-advanced-modal__field">
          <div class="search-advanced-modal__field__label">
            <PhQuotes :size="20" class="text-secondary" />
            <span class="text-secondary">{{ t('searchAdvancedModal.exactPhrase') }}</span>
          </div>
          <div class="search-advanced-modal__field__input">
            <search-advanced-modal-tag-input
              v-model="form.exactPhrase"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <p class="search-advanced-modal__field__example">
              {{ t('searchAdvancedModal.exactPhraseExample') }}
            </p>
          </div>
        </div>

        <!-- None of these words (NOT) -->
        <div class="search-advanced-modal__field">
          <div class="search-advanced-modal__field__label">
            <PhTextStrikethrough :size="20" class="text-secondary" />
            <span class="text-secondary">{{ t('searchAdvancedModal.noneOfTheseWords') }}</span>
          </div>
          <div class="search-advanced-modal__field__input">
            <search-advanced-modal-tag-input
              v-model="form.noneWords"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <div class="d-flex gap-3 text-secondary">
              <p class="fst-italic mb-0">{{ t('searchAdvancedModal.noneOfTheseWordsExample1') }}</p>
              <p class="mb-0">{{ t('searchAdvancedModal.or') }}</p>
              <p class="fst-italic mb-0">{{ t('searchAdvancedModal.noneOfTheseWordsExample2') }}</p>
            </div>
          </div>
        </div>

        <!-- Any word with 1 character between (?) -->
        <div class="search-advanced-modal__field">
          <div class="search-advanced-modal__field__label">
            <PhQuestion :size="20" class="text-secondary" />
            <span class="text-secondary">{{ t('searchAdvancedModal.singleCharWildcard') }}</span>
          </div>
          <div class="search-advanced-modal__field__input">
            <div class="d-flex align-items-center gap-2">
              <b-form-input v-model="form.singleWildcardStart" :placeholder="t('searchAdvancedModal.placeholder')" />
              <span class="text-secondary">{{ t('searchAdvancedModal.and') }}</span>
              <b-form-input v-model="form.singleWildcardEnd" :placeholder="t('searchAdvancedModal.placeholder')" />
            </div>
            <p class="search-advanced-modal__field__example">
              {{ t('searchAdvancedModal.singleCharWildcardExample') }}
            </p>
          </div>
        </div>

        <!-- Any word with multiple characters between (*) -->
        <div class="search-advanced-modal__field">
          <div class="search-advanced-modal__field__label">
            <PhAsterisk :size="20" class="text-secondary" />
            <span class="text-secondary">{{ t('searchAdvancedModal.multiCharWildcard') }}</span>
          </div>
          <div class="search-advanced-modal__field__input">
            <div class="d-flex align-items-center gap-2">
              <b-form-input v-model="form.multiWildcardStart" :placeholder="t('searchAdvancedModal.placeholder')" />
              <span class="text-secondary">{{ t('searchAdvancedModal.and') }}</span>
              <b-form-input v-model="form.multiWildcardEnd" :placeholder="t('searchAdvancedModal.placeholder')" />
            </div>
            <p class="search-advanced-modal__field__example">
              {{ t('searchAdvancedModal.multiCharWildcardExample') }}
            </p>
          </div>
        </div>

        <!-- With spelling changes (Fuzzy) -->
        <div class="search-advanced-modal__field-group">
          <div class="search-advanced-modal__field">
            <div class="search-advanced-modal__field__label">
              <PhTextAa :size="20" class="text-secondary" />
              <span class="text-secondary">{{ t('searchAdvancedModal.fuzzySearch') }}</span>
            </div>
            <div class="search-advanced-modal__field__input">
              <b-form-input v-model="form.fuzzyTerm" :placeholder="t('searchAdvancedModal.placeholder')" />
              <div class="search-advanced-modal__slider">
                <label class="search-advanced-modal__slider__label">
                  {{ t('searchAdvancedModal.charactersDifferent') }}
                </label>
                <div class="search-advanced-modal__slider__controls">
                  <div
                    v-for="value in [0, 1, 2]"
                    :key="value"
                    class="search-advanced-modal__slider__option"
                    :class="{ 'search-advanced-modal__slider__option--active': form.fuzzyDistance === value }"
                    @click="form.fuzzyDistance = value"
                  >
                    {{ value }}
                  </div>
                </div>
              </div>
              <p class="search-advanced-modal__field__example">
                {{ t('searchAdvancedModal.fuzzySearchExample') }}
              </p>
            </div>
          </div>
          <div class="search-advanced-modal__explanation">
            <p class="mb-2">{{ t('searchAdvancedModal.fuzzySearchExplanation1') }}</p>
            <p class="mb-0">{{ t('searchAdvancedModal.fuzzySearchExplanation2') }}</p>
          </div>
        </div>

        <!-- With phrase changes (Proximity) -->
        <div class="search-advanced-modal__field-group">
          <div class="search-advanced-modal__field">
            <div class="search-advanced-modal__field__label">
              <PhArrowsOutLineHorizontal :size="20" class="text-secondary" />
              <span class="text-secondary">{{ t('searchAdvancedModal.proximitySearch') }}</span>
            </div>
            <div class="search-advanced-modal__field__input">
              <b-form-input v-model="form.proximityPhrase" :placeholder="t('searchAdvancedModal.placeholder')" />
              <div class="search-advanced-modal__slider">
                <label class="search-advanced-modal__slider__label">
                  {{ t('searchAdvancedModal.maxWordsApart') }}
                </label>
                <div class="search-advanced-modal__slider__controls">
                  <div
                    v-for="value in [0, 1, 2, 3, 4, 5, 6]"
                    :key="value"
                    class="search-advanced-modal__slider__option"
                    :class="{ 'search-advanced-modal__slider__option--active': form.proximityDistance === value }"
                    @click="form.proximityDistance = value"
                  >
                    {{ value }}
                  </div>
                </div>
              </div>
              <p class="search-advanced-modal__field__example">
                {{ t('searchAdvancedModal.proximitySearchExample') }}
              </p>
            </div>
          </div>
          <div class="search-advanced-modal__explanation">
            <p class="mb-2">{{ t('searchAdvancedModal.proximitySearchExplanation1') }}</p>
            <p class="mb-2">{{ t('searchAdvancedModal.proximitySearchExplanation2') }}</p>
            <p class="mb-2">{{ t('searchAdvancedModal.proximitySearchExplanation3') }}</p>
            <p class="mb-0">{{ t('searchAdvancedModal.proximitySearchExplanation4') }}</p>
          </div>
        </div>

        <!-- Search in specific fields -->
        <div class="search-advanced-modal__field">
          <div class="search-advanced-modal__field__label">
            <PhMagnifyingGlass :size="20" class="text-secondary" />
            <span class="text-secondary">{{ t('searchAdvancedModal.searchInFields') }}</span>
          </div>
          <div class="search-advanced-modal__field__checkboxes">
            <div class="form-check">
              <input
                id="field-all"
                v-model="form.fieldAll"
                type="checkbox"
                class="form-check-input"
                @change="handleFieldAllChange"
              />
              <label for="field-all" class="form-check-label fw-medium">
                {{ t('searchAdvancedModal.allFields') }}
              </label>
            </div>
            <div v-for="field in fields" :key="field.value" class="form-check">
              <input
                :id="`field-${field.value}`"
                v-model="form.selectedFields"
                type="checkbox"
                class="form-check-input"
                :value="field.value"
                @change="handleFieldChange"
              />
              <label :for="`field-${field.value}`" class="form-check-label d-flex align-items-center gap-2">
                <component :is="field.icon" :size="24" class="text-secondary" />
                <span class="text-secondary">{{ t(field.label) }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </app-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  PhEyeglasses,
  PhSmiley,
  PhSquare,
  PhQuotes,
  PhTextStrikethrough,
  PhQuestion,
  PhAsterisk,
  PhTextAa,
  PhArrowsOutLineHorizontal,
  PhMagnifyingGlass,
  PhNoteBlank,
  PhHash,
  PhFileText,
  PhUserList,
  PhUserSquare,
  PhTextColumns,
  PhTreeStructure,
  PhChatsTeardrop
} from '@phosphor-icons/vue'
import AppModal from '@/components/AppModal/AppModal.vue'
import AppModalHeader from '@/components/AppModal/AppModalHeader.vue'
import SearchAdvancedModalTagInput from './SearchAdvancedModalTagInput.vue'
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
  set: (value) => emit('update:modelValue', value)
})

const showAlert = ref(true)

const form = ref({
  anyWords: [],
  allWords: [],
  exactPhrase: [],
  noneWords: [],
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
})

const fields = [
  { value: 'content', label: 'searchAdvancedModal.fields.notes', icon: PhNoteBlank },
  { value: 'tags', label: 'searchAdvancedModal.fields.tags', icon: PhHash },
  { value: 'path', label: 'searchAdvancedModal.fields.documentsNames', icon: PhFileText },
  { value: 'contentAuthor', label: 'searchAdvancedModal.fields.authorsNames', icon: PhUserList },
  { value: 'contentRecipient', label: 'searchAdvancedModal.fields.recipientsNames', icon: PhUserSquare },
  { value: 'content', label: 'searchAdvancedModal.fields.documentsContents', icon: PhTextColumns },
  { value: 'dirname', label: 'searchAdvancedModal.fields.documentsPaths', icon: PhTreeStructure },
  { value: 'contentThreadId', label: 'searchAdvancedModal.fields.threadsIds', icon: PhChatsTeardrop }
]

function handleDismissAlert() {
  showAlert.value = false
}

function handleFieldAllChange() {
  if (form.value.fieldAll) {
    form.value.selectedFields = []
  }
}

function handleFieldChange() {
  if (form.value.selectedFields.length > 0) {
    form.value.fieldAll = false
  } else {
    form.value.fieldAll = true
  }
}

function handleSearch() {
  const query = generateQuery(form.value)
  emit('search', query)
  isVisible.value = false
}
</script>

<style lang="scss" scoped>
.search-advanced-modal {
  display: flex;
  flex-direction: column;
  gap: $spacer * 2;

  &__alert {
    background-color: var(--bs-info-bg-subtle);
    border-color: var(--bs-info-border-subtle);
    color: var(--bs-body-color);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacer * 1.5;
  }

  &__field {
    display: flex;
    gap: $spacer;
    align-items: flex-start;

    &__label {
      display: flex;
      align-items: center;
      gap: $spacer * 0.5;
      min-width: 368px;
      flex-shrink: 0;
      font-size: $font-size-base;
      color: var(--bs-secondary-color);
    }

    &__input {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $spacer;
    }

    &__example {
      font-style: italic;
      font-size: $font-size-base;
      color: var(--bs-secondary-color);
      margin: 0;
    }

    &__checkboxes {
      display: flex;
      flex-direction: column;
      gap: $spacer;

      .form-check {
        margin: 0;
      }

      .form-check-label {
        cursor: pointer;
      }
    }
  }

  &__field-group {
    display: flex;
    flex-direction: column;
    gap: $spacer * 0.5;
  }

  &__explanation {
    padding-left: calc(368px + $spacer);
    font-size: $font-size-base;
    color: var(--bs-secondary-color);
    line-height: 1.25;
  }

  &__slider {
    display: flex;
    gap: $spacer * 1.5;
    align-items: center;

    &__label {
      font-size: $font-size-base;
      color: var(--bs-primary);
      margin: 0;
    }

    &__controls {
      display: flex;
      gap: $spacer * 2.5;
      align-items: center;
    }

    &__option {
      padding: $spacer * 0.5 $spacer;
      font-size: $font-size-base;
      color: var(--bs-primary);
      cursor: pointer;
      border-radius: $border-radius-sm;
      transition: all 0.2s;

      &:hover {
        background-color: var(--bs-gray-200);
      }

      &--active {
        background-color: var(--bs-primary);
        color: var(--bs-white);
      }
    }
  }
}
</style>
