<script setup>
import { ref, computed, watch, nextTick, toRef, useTemplateRef } from 'vue'
import { AppIcon } from '@icij/murmur'
import { cloneDeep, isArray, isEqual, trim } from 'lodash'

import DropdownSelectorSearch from '@/components/DropdownSelector/DropdownSelectorSearch'
import DropdownSelectorSelectAll from '@/components/DropdownSelector/DropdownSelectorSelectAll'
import { useDropdownSelection } from '@/composables/useDropdownSelection'
import { useListNavigation } from '@/composables/useListNavigation'
import { iwildcardMatch } from '@/utils/strings'

/**
 * A generic, slot-first selection dropdown. Owns selection, optional
 * filter-search, keyboard navigation, select-all and pin-selected.
 */
defineOptions({ name: 'DropdownSelector' })

const modelValue = defineModel({ type: [String, Array, Object], default: null })

const props = defineProps({
  /**
   * Options list (any shape).
   */
  options: {
    type: Array,
    default: () => []
  },
  /**
   * How to derive a unique key from an option: a property name, a getter, or
   * null for identity.
   */
  optionKey: {
    type: [String, Function],
    default: null
  },
  /**
   * Select multiple values (model value is an array).
   */
  multiple: {
    type: Boolean
  },
  /**
   * Show the built-in search input and filter the options.
   */
  searchable: {
    type: Boolean
  },
  /**
   * Predicate used to filter options while searching: (option, query) => Boolean.
   * Defaults to a case-insensitive wildcard match on the option key.
   */
  optionFilter: {
    type: Function,
    default: null
  },
  /**
   * Show the select-all row (multiple mode only).
   */
  allowSelectAll: {
    type: Boolean
  },
  /**
   * Pin selected options to the top; re-pin on close.
   */
  pinSelected: {
    type: Boolean
  },
  /**
   * Remove the default padding on each item link, letting the item slot own
   * its layout (used when the slot renders a custom row, e.g. project entries).
   */
  flushItems: {
    type: Boolean
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
   * Dropdown placement (bottom, top, bottom-end, etc).
   * No default: leaving it undefined lets b-dropdown fall back to its own
   * default ("bottom-start"), since b-dropdown's placement resolver cannot
   * handle an explicit null.
   */
  placement: {
    type: String,
    default: undefined
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
  },
  /**
   * Placeholder for the built-in search input.
   */
  searchPlaceholder: {
    type: String,
    default: null
  },
  /**
   * Label for the select-all row.
   */
  selectAllLabel: {
    type: String,
    default: null
  },
  /**
   * Message shown when the search matches no option.
   */
  noMatchesLabel: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['change', 'shown', 'hidden'])

/**
 * Template refs and local state
 */
const dropdown = useTemplateRef('dropdown')
const visible = ref(false)
const query = ref('')
// Snapshot of the value when the dropdown opened, used to detect a change on close.
const initialValue = ref(null)
// Keys pinned to the top; snapshotted on open/close to avoid a visible reorder flash.
const pinnedKeys = ref([])

// Multiple mode is explicit, but an array model value also implies it.
const multiple = computed(() => props.multiple || isArray(modelValue.value))

/**
 * Selection
 */
const {
  keyOf,
  selectedValues,
  selectedKeys,
  isSelected,
  isRequiredSelection,
  toggleValue,
  toggleUniqueValue,
  selectAll,
  unselectAll
} = useDropdownSelection(modelValue, toRef(props, 'options'), { multiple, optionKey: props.optionKey })

/**
 * Filtering
 */
const hasQuery = computed(() => !!query.value)

// Default filter matches the option key with a wildcard on both sides.
const defaultOptionFilter = (option, currentQuery) => {
  const wildcard = '*' + trim(currentQuery, '*') + '*'
  return iwildcardMatch(String(keyOf(option) ?? ''), wildcard)
}

const filteredOptions = computed(() => {
  if (!props.searchable || !hasQuery.value) {
    return props.options
  }
  const predicate = props.optionFilter ?? defaultOptionFilter
  return props.options.filter(option => predicate(option, query.value))
})

const hasMatches = computed(() => !hasQuery.value || filteredOptions.value.length > 0)

/**
 * Pinning
 */
const isPinned = option => pinnedKeys.value.some(key => isEqual(key, keyOf(option)))

const orderedOptions = computed(() => {
  if (!props.pinSelected) {
    return filteredOptions.value
  }
  return [...filteredOptions.value].sort((a, b) => Number(isPinned(b)) - Number(isPinned(a)))
})

function pinSelectedOptions() {
  pinnedKeys.value = selectedKeys.value.slice()
}

// Snapshot the initial selection so the first open already shows it on top.
pinSelectedOptions()

/**
 * Keyboard navigation
 */
const { focusIndex, moveFocusUp, moveFocusDown, resetFocus, selectFocused } = useListNavigation(orderedOptions, {
  onEnter: (event, option) => {
    toggleUniqueValue(event, option)
    hide()
  }
})

// Scroll the focused item into view once the DOM reflects the new index.
watch(focusIndex, async () => {
  await nextTick()
  const focused = dropdown.value?.$el?.querySelector('.dropdown-selector__item--focus')
  focused?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
})

// Typing a query focuses the first match; clearing it removes focus.
watch(query, () => {
  focusIndex.value = query.value && orderedOptions.value.length ? 0 : -1
})

// Selecting a value clears the query and focus, matching the previous behaviour.
watch(selectedKeys, () => {
  if (props.searchable) {
    query.value = ''
  }
  resetFocus()
})

/**
 * Select-all
 */
const selectAllModel = computed({
  get() {
    return props.options.length > 0 && selectedKeys.value.length === props.options.length
  },
  set(value) {
    if (value) {
      selectAll()
    }
    else {
      unselectAll()
    }
  }
})

/**
 * Lifecycle
 */
function onShown($event) {
  initialValue.value = cloneDeep(modelValue.value)
  emit('shown', $event)
}

function onHidden($event) {
  // Re-pin while hidden so the reorder happens off-screen (no visible flash).
  if (props.pinSelected) {
    pinSelectedOptions()
  }
  if (!isEqual(initialValue.value, modelValue.value)) {
    emit('change', $event)
  }
  emit('hidden', $event)
}

/**
 * Imperative API
 */
function hide() {
  dropdown.value?.hide?.()
}

function focus() {
  dropdown.value?.$el?.querySelector('.dropdown-toggle')?.focus()
}

defineExpose({ hide, focus })
</script>

<template>
  <b-dropdown
    ref="dropdown"
    v-model="visible"
    class="dropdown-selector"
    :disabled="disabled"
    :placement="placement"
    no-caret
    menu-class="dropdown-selector__menu"
    toggle-class="d-inline-flex align-items-center p-2 text-body"
    boundary="viewport"
    :teleport-to="teleportTo"
    :teleport-disabled="teleportDisabled"
    variant="outline-tertiary"
    @shown="onShown"
    @hidden="onHidden"
  >
    <template #button-content>
      <slot
        name="button-content"
        v-bind="{ selectedOptions: selectedValues, selectedKeys }"
      />
      <app-icon
        v-if="!noCaret"
        class="ms-2"
      >
        <i-ph-caret-down />
      </app-icon>
    </template>

    <dropdown-selector-search
      v-if="searchable"
      v-model="query"
      :autofocus="visible"
      :has-matches="hasMatches"
      :placeholder="searchPlaceholder"
      :no-matches-label="noMatchesLabel"
      @click.stop
      @blur="resetFocus"
      @up="moveFocusUp"
      @down="moveFocusDown"
      @enter="selectFocused"
    />

    <dropdown-selector-select-all
      v-if="allowSelectAll && multiple && hasMatches"
      v-model="selectAllModel"
      :label="selectAllLabel"
      @click.stop
    />

    <!-- @slot Content inserted above the options list -->
    <slot
      name="above"
      v-bind="{ visible }"
    />

    <b-dropdown-item
      v-for="(option, index) in orderedOptions"
      :key="index"
      :active="isSelected(option)"
      :link-class="{ 'p-0': flushItems, 'dropdown-selector__item--focus': focusIndex === index }"
      class="dropdown-selector__item"
    >
      <slot
        name="item"
        v-bind="{
          option,
          index,
          selected: isSelected(option),
          selectionRequired: isRequiredSelection(option),
          focused: focusIndex === index,
          toggle: (event) => toggleValue(event, option),
          toggleUnique: (event) => toggleUniqueValue(event, option)
        }"
      />
    </b-dropdown-item>

    <!-- @slot Content inserted below the options list -->
    <slot
      name="below"
      v-bind="{ visible }"
    />
  </b-dropdown>
</template>

<style lang="scss">
.dropdown-selector {
  background: $input-bg;
  font-size: inherit;

  .btn {
    display: inline-flex;
    justify-content: center;
    white-space: nowrap;
    flex-wrap: nowrap;

    .input-group-lg & {
      font-size: 1.25rem;
    }

    &.disabled,
    &.disabled:hover {
      opacity: 1;
      background: $tertiary !important;
      color: $text-muted;
    }
  }

  &__menu {
    max-height: 50vh;
    overflow: auto;
    z-index: $zindex-sticky;
  }
}
</style>
