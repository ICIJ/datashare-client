<script setup>
import { ref, computed, watch, nextTick, useTemplateRef } from 'vue'
import { isEqual, iteratee, sortBy, uniqueId } from 'lodash'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import FieldDropdownSelector from '@/components/FieldDropdownSelector/FieldDropdownSelector'
import SearchBarInputDropdownForProjects from '@/components/Search/SearchBar/SearchBarInputDropdownForProjects'
import { useCore } from '@/composables/useCore'
import { useMobileDetect } from '@/composables/useMobileDetect'
import { useSearchSuggestions } from '@/composables/useSearchSuggestions'
import { useSearchStore } from '@/store/modules'

/**
 * The general search form.
 */
defineOptions({ name: 'SearchBar' })

const props = defineProps({
  /**
   * Placeholder in the search bar.
   */
  placeholder: { type: String, default: null },
  /**
   * Display the shortcuts button.
   */
  settings: { type: Boolean },
  /**
   * Hide the field dropdown
   */
  hideFieldDropdown: { type: Boolean },
  /**
   * Hide the projects dropdown
   */
  hideProjectsDropdown: { type: Boolean },
  /**
   * Search input size
   * @values sm, md, lg
   */
  size: { type: String, default: 'md' },
  /**
   * Force the search bar to search into given indices
   */
  indices: { type: Array, default: null },
  /**
   * Display the submit button
   */
  showSubmit: { type: Boolean, default: false },
  /**
   * Hide addons
   */
  compact: { type: Boolean, default: false },
  /**
   * Submit the search form clear filters if the project is changed.
   */
  clearFilters: { type: Boolean, default: false }
})

defineEmits(['submit'])

const core = useCore()
const router = useRouter()
const searchStore = useSearchStore()
const { isMobile } = useMobileDetect()
const { t } = useI18n()

const searchInput = useTemplateRef('searchInput')

const autofocus = !isMobile
const uid = uniqueId('search-bar-')

const field = ref(null)
const pristine = ref(true)
const focused = ref(false)
const query = ref(null)

// Projects currently selected, derived from the forced indices or the store.
const selectedProjects = computed({
  get() {
    const indices = props.indices ?? searchStore.indices
    return indices.filter(index => !!core.findProject(index)).map(name => ({ name }))
  },
  set(projects) {
    searchStore.setIndices(projects.map(iteratee('name')))
  }
})

const formIndices = computed(() => selectedProjects.value.map(iteratee('name')))

const localizedPlaceholder = computed(() => props.placeholder ?? t('search.placeholder'))
const sameIndices = computed(() => isEqual(sortBy(searchStore.indices), sortBy(props.indices)))
const mustClearFilters = computed(() => props.clearFilters && !sameIndices.value)

const { suggestions, activeSuggestions, suggestTerms, searchTerms, selectTerm, hideSuggestions } = useSearchSuggestions({
  query,
  field,
  formIndices,
  focused
})

const hiddenSuggestions = computed(() => !suggestions.value.length || pristine.value)

// Keep the local query and field mirrored from the store.
watch(
  () => searchStore.q,
  (value) => {
    query.value = value
  },
  { immediate: true }
)

watch(
  () => searchStore.field,
  (value) => {
    field.value = value
  },
  { immediate: true }
)

function submit() {
  hideSuggestions()
  if (mustClearFilters.value) {
    searchStore.resetFilterValues()
  }
  // Update the store before pushing the route with the new query.
  searchStore.setIndices(formIndices.value)
  searchStore.setField(field.value)
  searchStore.setQuery(query.value)
  searchStore.setFrom(0)
  searchStore.refreshStamp()
  router.push({ name: 'search', query: searchStore.toRouteQueryWithStamp })
}

function onSelectTerm(term) {
  const nextQuery = selectTerm(term)
  if (term) {
    query.value = nextQuery
  }
}

function hideSuggestionsAfterDelay() {
  setTimeout(() => {
    nextTick(hideSuggestions)
  }, 200)
}

function onBlur() {
  focused.value = false
  hideSuggestionsAfterDelay()
}

function onSubmit() {
  hideSuggestions()
  submit()
}

function onInput() {
  pristine.value = false
  searchTerms()
}

function onFocus() {
  focused.value = true
  searchTerms()
}

function onClear() {
  if (searchStore.q) {
    onSubmit()
  }
}

async function focusOnSearchInput() {
  await nextTick()
  searchInput.value.focus()
}

defineExpose({ submit, suggestTerms, query, field, suggestions })
</script>

<template>
  <div
    :id="uid"
    class="search-bar"
    :class="{ 'search-bar--focused': focused }"
  >
    <div class="d-flex align-items-center">
      <search-bar-input
        ref="searchInput"
        v-model="query"
        class="search-bar__input w-100"
        :autofocus="autofocus"
        :compact="compact"
        :placeholder="localizedPlaceholder"
        :show-submit="showSubmit"
        :size="size"
        @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @clear="onClear"
        @submit="onSubmit"
      >
        <template #addons>
          <field-dropdown-selector
            v-if="!hideFieldDropdown"
            v-model="field"
            :disabled="!!indices"
            @changed="focusOnSearchInput"
          />
          <search-bar-input-dropdown-for-projects
            v-if="!hideProjectsDropdown"
            v-model="selectedProjects"
            :disabled="!!indices"
            :no-caret="!!indices"
          />
        </template>
        <template #suggestions>
          <selectable-dropdown
            ref="suggestions"
            class="search-bar__suggestions dropdown-menu shadow-lg bg-action-subtle border-action-subtle"
            :hide="hiddenSuggestions"
            :items="suggestions"
            :active-items="activeSuggestions"
            @update:model-value="onSelectTerm"
            @click="submit"
          >
            <template #item-label="{ item }">
              <div class="d-flex">
                <div class="flex-grow-1 text-truncate">
                  {{ item.key }}
                </div>
              </div>
            </template>
          </selectable-dropdown>
        </template>
      </search-bar-input>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-bar {
  &:deep(.search-bar-input__input) {
    height: auto;
  }

  &--focused:deep(.input-group-append .dropdown-toggle) {
    border-top-color: $primary;
    border-bottom-color: $primary;
  }

  &:deep(.dropdown-toggle) {
    border: 0;
  }

  & &__suggestions.dropdown-menu {
    left: 0;
    position: absolute !important;
    right: 0;
    top: 100%;
  }

  &__suggestions {
    box-shadow: $dropdown-box-shadow;
    margin-top: $dropdown-spacer;

    & .dropdown-item {
      cursor: pointer;

      &:active,
      &:focus,
      &.active {
        color: white;
      }
    }
  }
}
</style>
