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
            <h5 class="mb-0 fw-bold">
              {{ t('searchAdvancedModal.title') }}
            </h5>
            <ph-eyeglasses
              :size="24"
              weight="regular"
              class="text-secondary"
            />
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
          <ph-smiley
            :size="20"
            weight="bold"
          />
          <span>{{ t('searchAdvancedModal.alertMessage') }}</span>
        </div>
        <b-button
          variant="outline-info"
          size="sm"
          @click="handleDismissAlert"
        >
          {{ t('searchAdvancedModal.alertButton') }}
        </b-button>
      </b-alert>

      <!-- Form -->
      <div class="search-advanced-modal__form">
        <!-- Any of these words (OR) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.anyOfTheseWords')"
          :icon="PhSquare"
        >
          <form-control-tag
            v-model="form.anyWords"
            :placeholder="t('searchAdvancedModal.placeholder')"
            no-duplicates
          />
          <p class="search-advanced-modal__field__example">
            {{ t('searchAdvancedModal.anyOfTheseWordsExample') }}
          </p>
        </search-advanced-modal-field>

        <!-- All these words (AND) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.allTheseWords')"
          :icon="PhSquare"
        >
          <form-control-tag
            v-model="form.allWords"
            :placeholder="t('searchAdvancedModal.placeholder')"
            no-duplicates
          />
          <div class="d-flex gap-3 text-secondary small">
            <p class="fst-italic mb-0">
              {{ t('searchAdvancedModal.allTheseWordsExample1') }}
            </p>
            <p class="mb-0">
              {{ t('searchAdvancedModal.or') }}
            </p>
            <p class="fst-italic mb-0">
              {{ t('searchAdvancedModal.allTheseWordsExample2') }}
            </p>
          </div>
        </search-advanced-modal-field>

        <!-- This exact word or phrase -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.exactPhrase')"
          :icon="PhQuotes"
        >
          <form-control-tag
            v-model="form.exactPhrase"
            :placeholder="t('searchAdvancedModal.placeholder')"
            no-duplicates
          />
          <p class="search-advanced-modal__field__example">
            {{ t('searchAdvancedModal.exactPhraseExample') }}
          </p>
        </search-advanced-modal-field>

        <!-- None of these words (NOT) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.noneOfTheseWords')"
          :icon="PhTextStrikethrough"
        >
          <form-control-tag
            v-model="form.noneWords"
            :placeholder="t('searchAdvancedModal.placeholder')"
            no-duplicates
          />
          <div class="d-flex gap-3 text-secondary small">
            <p class="fst-italic mb-0">
              {{ t('searchAdvancedModal.noneOfTheseWordsExample1') }}
            </p>
            <p class="mb-0">
              {{ t('searchAdvancedModal.or') }}
            </p>
            <p class="fst-italic mb-0">
              {{ t('searchAdvancedModal.noneOfTheseWordsExample2') }}
            </p>
          </div>
        </search-advanced-modal-field>

        <!-- Any word with 1 character between (?) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.singleCharWildcard')"
          :icon="PhQuestion"
        >
          <div class="d-flex align-items-center gap-2">
            <b-form-input
              v-model="form.singleWildcardStart"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <span class="text-secondary">
              {{ t('searchAdvancedModal.and') }}
            </span>
            <b-form-input
              v-model="form.singleWildcardEnd"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
          </div>
          <p class="search-advanced-modal__field__example">
            {{ t('searchAdvancedModal.singleCharWildcardExample') }}
          </p>
        </search-advanced-modal-field>

        <!-- Any word with multiple characters between (*) -->
        <search-advanced-modal-field
          :label="t('searchAdvancedModal.multiCharWildcard')"
          :icon="PhAsterisk"
        >
          <div class="d-flex align-items-center gap-2">
            <b-form-input
              v-model="form.multiWildcardStart"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <span class="text-secondary">
              {{ t('searchAdvancedModal.and') }}
            </span>
            <b-form-input
              v-model="form.multiWildcardEnd"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
          </div>
          <p class="search-advanced-modal__field__example">
            {{ t('searchAdvancedModal.multiCharWildcardExample') }}
          </p>
        </search-advanced-modal-field>

        <!-- With spelling changes (Fuzzy) -->
        <div class="search-advanced-modal__field-group">
          <search-advanced-modal-field
            :label="t('searchAdvancedModal.fuzzySearch')"
            :icon="PhTextAa"
          >
            <b-form-input
              v-model="form.fuzzyTerm"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <div class="d-flex gap-3 align-items-center mt-3">
              <label class="mb-0 text-primary">
                {{ t('searchAdvancedModal.charactersDifferent') }}
              </label>
              <form-control-range
                v-model="form.fuzzyDistance"
                :min="0"
                :max="2"
                :step="1"
              />
            </div>
            <p class="search-advanced-modal__field__example">
              {{ t('searchAdvancedModal.fuzzySearchExample') }}
            </p>
          </search-advanced-modal-field>
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
            :icon="PhArrowsOutLineHorizontal"
          >
            <b-form-input
              v-model="form.proximityPhrase"
              :placeholder="t('searchAdvancedModal.placeholder')"
            />
            <div class="d-flex gap-3 align-items-center mt-3">
              <label class="mb-0 text-primary">
                {{ t('searchAdvancedModal.maxWordsApart') }}
              </label>
              <form-control-range
                v-model="form.proximityDistance"
                :min="0"
                :max="6"
                :step="1"
              />
            </div>
            <p class="search-advanced-modal__field__example">
              {{ t('searchAdvancedModal.proximitySearchExample') }}
            </p>
          </search-advanced-modal-field>
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
          :icon="PhMagnifyingGlass"
        >
          <div class="search-advanced-modal__field__checkboxes">
            <div class="form-check">
              <input
                id="field-all"
                v-model="form.fieldAll"
                type="checkbox"
                class="form-check-input"
                @change="handleFieldAllChange"
              >
              <label
                for="field-all"
                class="form-check-label fw-medium"
              >
                {{ t('searchAdvancedModal.allFields') }}
              </label>
            </div>
            <div
              v-for="field in fields"
              :key="field.value"
              class="form-check"
            >
              <input
                :id="`field-${field.value}`"
                v-model="form.selectedFields"
                type="checkbox"
                class="form-check-input"
                :value="field.value"
                @change="handleFieldChange"
              >
              <label
                :for="`field-${field.value}`"
                class="form-check-label d-flex align-items-center gap-2"
              >
                <component
                  :is="field.icon"
                  :size="24"
                  class="text-secondary"
                />
                <span class="text-secondary">{{ t(field.label) }}</span>
              </label>
            </div>
          </div>
        </search-advanced-modal-field>
      </div>
    </div>
  </app-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
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
import FormControlTag from '@/components/Form/FormControl/FormControlTag/FormControlTag.vue'
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
  }
  else {
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

  &__field-group {
    display: flex;
    flex-direction: column;
    gap: $spacer * 0.5;
  }

  &__field__example {
    font-style: italic;
    font-size: $font-size-base;
    color: var(--bs-secondary-color);
    margin: 0;
  }

  &__field__checkboxes {
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

  &__explanation {
    padding-left: calc(368px + $spacer);
    font-size: $font-size-base;
    color: var(--bs-secondary-color);
    line-height: 1.25;
  }
}
</style>
