<script setup>
import { isNumber, isString } from 'lodash'
import { computed, useTemplateRef, reactive, provide } from 'vue'
import { useElementSize } from '@vueuse/core'
import { vElementSize } from '@vueuse/components'
import { BDropdownItem } from 'bootstrap-vue-next'

import AppDropdown from '@/components/AppDropdown/AppDropdown'

const props = defineProps({
  reverse: {
    type: Boolean,
    default: false
  },
  entries: {
    type: Array,
    default: () => []
  },
  entryTag: {
    type: String,
    default: 'div'
  },
  dropdownClass: {
    type: [String, Array, Object]
  },
  dropdownToggleClass: {
    type: [String, Array, Object],
    default: null
  },
  dropdownButtonIcon: {
    type: [String, Object, Array]
  },
  dropdownButtonIconWeight: {
    type: String
  },
  dropdownDisabled: {
    type: Boolean
  },
  dropdownEntryTag: {
    type: String,
    default: () => BDropdownItem
  },
  dropdownTeleportTo: {
    type: [String, Boolean, Object],
    default: 'body'
  },
  dropdownVariant: {
    type: String,
    default: null
  },
  dropdownSize: {
    type: String,
    default: 'sm'
  },
  listClass: {
    type: [String, Array, Object]
  },
  threshold: {
    type: Number,
    default: 0
  },
  minVisibleEntries: {
    type: Number,
    default: 1
  }
})

const listRef = useTemplateRef('list')
const { width: listWidth } = useElementSize(listRef)
const registeredEntries = reactive([])
const entriesSize = reactive({})

function registerEntry(entry) {
  if (!registeredEntries.includes(entry)) {
    registeredEntries.push(entry)
    entriesSize[registeredEntries.length - 1] = entry.exposed.size
  }
}

provide('registerEntry', registerEntry)

function unregisterEntry(entry) {
  const index = registeredEntries.indexOf(entry)
  if (index !== -1) {
    registeredEntries.splice(index, 1)
    delete entriesSize[index]
  }
}

provide('unregisterEntry', unregisterEntry)

function registerEntrySize(index) {
  return (rect) => {
    entriesSize[index] = rect
  }
}

function getEntry(indexOrEntry) {
  return isNumber(indexOrEntry)
    ? allEntries.value[indexOrEntry]
    : indexOrEntry
}

function getEntryIndex(indexOrEntry) {
  return isNumber(indexOrEntry)
    ? indexOrEntry
    : allEntries.value.indexOf(indexOrEntry)
}

function getEntryLabel(indexOrEntry) {
  const entry = getEntry(indexOrEntry)
  const index = getEntryIndex(indexOrEntry)
  // We display the exposed label if the entry is a component instance
  // or the entry itself if it's a string, otherwise we fallback to the index
  return entry?.exposed?.label || (isString(entry) ? entry : index)
}

function getEntrySize(indexOrEntry) {
  const index = getEntryIndex(indexOrEntry)
  const entry = getEntry(index)
  return entry?.exposed?.size ?? entriesSize[index] ?? { width: 0, height: 0 }
}

function getEntryVisibility(indexOrEntry) {
  const index = getEntryIndex(indexOrEntry)
  return entriesVisibility.value[index] ?? false
}

provide('getEntryVisibility', getEntryVisibility)

function getEntryClass(indexOrEntry) {
  return {
    'parent-overflow-entries__list__entry--hidden': !getEntryVisibility(indexOrEntry),
    'parent-overflow-entries__list__entry--has-separator': hasVisibleNextEntry(indexOrEntry),
  }
}

function getEntryBinding(indexOrEntry) {
  const index = getEntryIndex(indexOrEntry)
  const entry = getEntry(indexOrEntry)
  const size = getEntrySize(index)
  const visible = getEntryVisibility(index)
  const hasVisibleNext = hasVisibleNextEntry(index)
  return { entry, size, visible, hasVisibleNext }
}

provide('getEntryBinding', getEntryBinding)

function hasVisibleNextEntry(indexOrEntry) {
  const index = getEntryIndex(indexOrEntry)
  return getEntryVisibility(index) && getEntryVisibility(index + 1)
}

function isLastEntry(indexOrEntry) {
  const index = getEntryIndex(indexOrEntry)
  return index === allEntries.value.length - 1
}

const allEntries = computed(() => Object.values(registeredEntries).length ? registeredEntries : props.entries)

const entriesVisibility = computed(() => {
  let totalWidth = 0
  // When the prop "reverse" is true, we need to iterate the entries in reverse order
  // to calculate the visibility correctly from the start.
  return [...allEntries.value].reverse(props.reverse).reduce((visibility, entry, i) => {
    const { width } = getEntrySize(entry)
    const index = props.reverse ? allEntries.value.length - 1 - i : i
    totalWidth += width
    visibility[index] = i < props.minVisibleEntries || totalWidth <= listWidth.value - props.threshold
    return visibility
  }, {})
})

const hiddenEntries = computed(() => {
  return allEntries.value.filter((entry, index) => {
    return entriesVisibility.value[index] === false
  })
})

const hasHiddenEntries = computed(() => hiddenEntries.value.length > 0)
const hasDropdownSeparator = computed(() => hasHiddenEntries.value && hiddenEntries.value.length < allEntries.value.length && props.reverse)

const classList = computed(() => {
  return {
    'parent-overflow-entries--reverse': props.reverse
  }
})
</script>

<template>
  <div
    class="parent-overflow-entries"
    :class="classList"
  >
    <div
      ref="list"
      class="parent-overflow-entries__list"
      :class="listClass"
    >
      <div
        v-if="hasDropdownSeparator"
        class="parent-overflow-entries__dropdown-separator"
      >
        <slot name="separator" />
      </div>
      <slot>
        <component
          :is="entryTag"
          v-for="(entry, index) in entries"
          :key="index"
          v-element-size="registerEntrySize(index)"
          :aria-hidden="!getEntryVisibility(index)"
          :class="getEntryClass(index)"
          class="parent-overflow-entries__list__entry"
        >
          <slot
            name="entry"
            v-bind="getEntryBinding(index)"
          >
            {{ entry }}
          </slot>
          <div
            v-if="!isLastEntry(index)"
            class="parent-overflow-entries__list__entry__separator"
            :aria-hidden="!hasVisibleNextEntry(index)"
          >
            <slot name="separator" />
          </div>
        </component>
      </slot>
    </div>
    <app-dropdown
      v-if="hasHiddenEntries"
      class="parent-overflow-entries__dropdown"
      :size="dropdownSize"
      :disabled="dropdownDisabled"
      :teleport-to="dropdownTeleportTo"
      :class="dropdownClass"
      :toggle-class="dropdownToggleClass"
      :variant="dropdownVariant"
      :button-icon="dropdownButtonIcon"
      :button-icon-weight="dropdownButtonIconWeight"
    >
      <template
        v-for="(entry, index) in hiddenEntries"
        :key="index"
      >
        <slot
          name="dropdown-entry"
          v-bind="getEntryBinding(entry)"
        >
          <component :is="dropdownEntryTag">
            {{ getEntryLabel(entry) }}
          </component>
        </slot>
      </template>
    </app-dropdown>
  </div>
</template>

<style scoped lang="scss">
.parent-overflow-entries {
  --parent-overflow-entries-flex-direction: row;

  display: flex;
  flex-wrap: nowrap;
  flex-direction: var(--parent-overflow-entries-flex-direction);
  align-items: center;

  &--reverse {
    --parent-overflow-entries-flex-direction: row-reverse;
  }

  &__dropdown-separator {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 0;
  }

  &__list {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 0;
    overflow: visible;

    &__entry {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      flex-shrink: 0;
      flex-grow: 0;

      &__separator {
        visibility: hidden;
        flex-shrink: 0;
        flex-grow: 0;
      }

      &--hidden {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        z-index: -1;
        contain: layout style paint;
      }

      &--has-separator &__separator {
        visibility: visible;
      }
    }
  }

  &__dropdown {
    margin-left: auto;
    flex-shrink: 0;
    flex-grow: 0;
  }
}
</style>
