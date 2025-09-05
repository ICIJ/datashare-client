<template>
  <search-bar-input-dropdown
    ref="inputDropdown"
    v-model="selectedProjects"
    class="project-dropdown-selector"
    :multiple="multiple"
    flush-items
    :class="{
      'project-dropdown-selector--multiple': hasMultipleProjects
    }"
    :disabled="disabled"
    :no-caret="noCaret"
    :options="options"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    @selected="reset"
    @hidden="emit('hidden', $event)"
    @changed="emit('changed', $event)"
  >
    <template #above="{ visible }">
      <project-dropdown-selector-search
        v-model="query"
        :autofocus="visible"
        :has-matches="hasMatches"
        @blur="resetFocus"
        @up="moveFocusUp"
        @down="moveFocusDown"
        @enter="selectFocusValue"
        @click.stop
      />
      <project-dropdown-selector-all
        v-if="hasMatches && multiple"
        v-model="selectAll"
        @click.stop
      />
    </template>
    <template #button-content>
      <project-dropdown-selector-button-content
        :slice-size="sliceSize"
        :selected-projects="selectedProjects"
        :projects="projects"
      />
    </template>
    <template #dropdown-item="{ option: project, index, hasValue, toggleUniqueValue, toggleValue }">
      <project-dropdown-selector-entry
        :project="project"
        :focus="focusIndex === index"
        :selected="hasValue(project)"
        :no-checkbox="!multiple"
        @toggle-value="toggleValue($event, project)"
        @toggle-unique-value="toggleUniqueValue($event, project)"
      />
    </template>
  </search-bar-input-dropdown>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { compact, find, isArray, trim } from 'lodash'

import ProjectDropdownSelectorAll from './ProjectDropdownSelectorAll'
import ProjectDropdownSelectorButtonContent from './ProjectDropdownSelectorButtonContent'
import ProjectDropdownSelectorEntry from './ProjectDropdownSelectorEntry'
import ProjectDropdownSelectorSearch from './ProjectDropdownSelectorSearch'

import SearchBarInputDropdown from '@/components/Search/SearchBar/SearchBarInputDropdown'
import { iwildcardMatch } from '@/utils/strings'

/**
 * Props definition
 */
const props = defineProps({
  /**
   * List of selected projects (multiple selection), or object (single selection)
   */
  modelValue: {
    type: [Array, Object],
    default: () => []
  },
  /**
   * Limit the number of visible project thumbnails
   */
  sliceSize: {
    type: Number,
    default: 3
  },
  /**
   * The dropdown toggler must be disabled.
   */
  disabled: {
    type: Boolean
  },
  /**
   * The caret in the dropdown toggler must be hidden.
   */
  noCaret: {
    type: Boolean
  },
  /**
   * List of projects
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Teleport the dropdown to a different element.
   */
  teleportTo: {
    type: [String, Object],
    default: 'body'
  },
  /**
   * Disable teleporting the dropdown to a different element.
   */
  teleportDisabled: {
    type: Boolean
  }
})

/**
 * Emits definition
 */
const emit = defineEmits(['hidden', 'changed', 'selected', 'update:modelValue'])

/**
 * Template refs
 */
const inputDropdown = ref(null)

/**
 * State
 */
const query = ref(null)
const focusIndex = ref(-1)

/**
 * Computed properties
 */
const hasQuery = computed(() => {
  return !!query.value
})

const hasMatches = computed(() => {
  return !hasQuery.value || options.value.length > 0
})

const wildcardQuery = computed(() => {
  if (hasQuery.value) {
    // This ensures the query ends and starts
    // with one (and only one) wildcard
    return '*' + trim(query.value, '*') + '*'
  }
  return '*'
})

const multiple = computed(() => {
  return isArray(props.modelValue)
})

const selectedProjects = computed({
  get() {
    if (!multiple.value) {
      return [props.modelValue]
    }
    return compact(
      props.modelValue.map(({ name }) => {
        return find(props.projects, { name })
      })
    )
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const options = computed(() => {
  return props.projects.filter(({ label = '', name = '' } = {}) => {
    return iwildcardMatch(label, wildcardQuery.value) || iwildcardMatch(name, wildcardQuery.value)
  })
})

const hasMultipleProjects = computed(() => {
  return selectedProjects.value?.length > 1
})

const selectAll = computed({
  get() {
    return selectedProjects.value?.length === props.projects.length
  },
  set(value) {
    selectedProjects.value = value ? props.projects : props.projects.slice(0, 1)
  }
})

/**
 * Watch
 */
watch(query, () => {
  focusIndex.value = query.value && options.value.length ? 0 : -1
})

/**
 * Methods
 */
function moveFocusUp() {
  focusIndex.value = Math.max(-1, focusIndex.value - 1)
  moveFocusIntoView()
}

function moveFocusDown() {
  focusIndex.value = Math.min(options.value.length - 1, focusIndex.value + 1)
  moveFocusIntoView()
}

async function moveFocusIntoView() {
  await nextTick()
  const selector = '.project-dropdown-selector__item--focus'
  const options = { behavior: 'instant', block: 'end' }
  inputDropdown.value.$el.querySelector(selector)?.scrollIntoView(false, options)
}

function selectFocusValue($event) {
  if (focusIndex.value > -1) {
    inputDropdown.value.toggleUniqueValue($event, options.value[focusIndex.value])
    inputDropdown.value.hide()
  }
}

function resetFocus() {
  focusIndex.value = -1
}

function resetQuery() {
  query.value = null
}

function reset() {
  resetFocus()
  resetQuery()
}
</script>

<style lang="scss" scoped>
.project-dropdown-selector {
  &:deep(.btn.dropdown-toggle) {
    --bs-btn-color: var(--bs-body-color);
    --bs-btn-border-color: var(--bs-light);
    --bs-btn-bg: var(--bs-body-bg);
    --bs-btn-hover-bg: var(--bs-btn-bg);
    --bs-btn-hover-color: var(--bs-btn-color);
    --bs-btn-hover-border-color: var(--bs-primary);
    --bs-btn-disabled-bg: var(--bs-btn-bg);
    --bs-btn-disabled-color: var(--bs-btn-color);
    --bs-btn-disabled-border-color: var(--bs-btn-border-color);
    --bs-btn-active-color: var(--bs-btn-color);
    --bs-btn-active-bg: rgba(var(--bs-body-color-rgb), 0.2);
    --bs-btn-active-border-color: var(--bs-light);
  }

  .dropdown-item:focus-visible &:deep(.project-dropdown-selector-entry),
  .dropdown-item:focus &:deep(.project-dropdown-selector-entry) {
    position: relative;
    color: $dropdown-link-hover-color;
    background: $dropdown-link-hover-bg;
    text-decoration: none;
    box-shadow: $focus-ring-box-shadow;
    outline: 0;
  }

  .dropdown-item:focus-visible,
  .dropdown-item:focus {
    outline: 0;
  }
}
</style>
