<script setup>
import { computed } from 'vue'
import { compact, find, isArray, trim } from 'lodash'
import { useI18n } from 'vue-i18n'

import ProjectDropdownSelectorButtonContent from './ProjectDropdownSelectorButtonContent'
import ProjectDropdownSelectorEntry from './ProjectDropdownSelectorEntry'

import DropdownSelector from '@/components/DropdownSelector/DropdownSelector'
import { iwildcardMatch } from '@/utils/strings'

defineOptions({ name: 'ProjectDropdownSelector' })

const props = defineProps({
  /**
   * Selected projects (array for multiple selection) or a single project object.
   */
  modelValue: {
    type: [Array, Object],
    default: () => []
  },
  /**
   * Limit the number of visible project thumbnails in the button.
   */
  sliceSize: {
    type: Number,
    default: 3
  },
  /**
   * Disable the dropdown toggler.
   */
  disabled: {
    type: Boolean
  },
  /**
   * Hide the caret in the toggler.
   */
  noCaret: {
    type: Boolean
  },
  /**
   * List of available projects.
   */
  projects: {
    type: Array,
    default: () => []
  },
  /**
   * Teleport the menu to a different element.
   */
  teleportTo: {
    type: [String, Object],
    default: 'body'
  },
  /**
   * Disable teleporting the menu.
   */
  teleportDisabled: {
    type: Boolean
  }
})

const emit = defineEmits(['hidden', 'changed', 'update:modelValue'])
const { t } = useI18n()

const multiple = computed(() => isArray(props.modelValue))

// Resolve the model value (which may carry only { name }) to full project
// objects from the catalog, so labels and thumbnails render.
const selectedProjects = computed({
  get() {
    if (!multiple.value) {
      if (!props.modelValue) {
        return null
      }
      return find(props.projects, { name: props.modelValue.name }) ?? props.modelValue
    }
    return compact(props.modelValue.map(({ name }) => find(props.projects, { name })))
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const hasMultipleProjects = computed(() => multiple.value && props.modelValue.length > 1)

// A project matches when its label OR its name matches the wildcard query.
function filterProject(project, query) {
  const wildcard = '*' + trim(query, '*') + '*'
  return iwildcardMatch(project.label ?? '', wildcard) || iwildcardMatch(project.name ?? '', wildcard)
}
</script>

<template>
  <dropdown-selector
    v-model="selectedProjects"
    class="project-dropdown-selector"
    :class="{ 'project-dropdown-selector--multiple': hasMultipleProjects }"
    :multiple="multiple"
    option-key="name"
    searchable
    :option-filter="filterProject"
    :allow-select-all="multiple"
    pin-selected
    flush-items
    :disabled="disabled"
    :no-caret="noCaret"
    :options="projects"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    :search-placeholder="t('projectDropdownSelectorSearch.placeholder')"
    :no-matches-label="t('projectDropdownSelectorSearch.noMatches')"
    :select-all-label="t('projectDropdownSelectorAll.label')"
    @change="emit('changed', $event)"
    @hidden="emit('hidden', $event)"
  >
    <template #button-content="{ selectedOptions }">
      <project-dropdown-selector-button-content
        :slice-size="sliceSize"
        :selected-projects="selectedOptions"
        :projects="projects"
      />
    </template>
    <template #item="{ option: project, selected, selectionRequired, focused, toggle, toggleUnique }">
      <project-dropdown-selector-entry
        :project="project"
        :focus="focused"
        :selected="selected"
        :selection-required="selectionRequired"
        :no-checkbox="!multiple"
        @toggle-value="toggle($event)"
        @toggle-unique-value="toggleUnique($event)"
      />
    </template>
  </dropdown-selector>
</template>

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
