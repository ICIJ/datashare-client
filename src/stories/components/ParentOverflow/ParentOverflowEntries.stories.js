import { BButton, BDropdownItem } from 'bootstrap-vue-next'

import ParentOverflowEntries from '@/components/ParentOverflow/ParentOverflowEntries'
import ParentOverflowEntriesItem from '@/components/ParentOverflow/ParentOverflowEntriesItem'

export default {
  title: 'Components/ParentOverflow/ParentOverflowEntries',
  tags: ['autodocs'],
  component: ParentOverflowEntries,
  argTypes: {
    entries: {
      control: { type: 'array' }
    },
    reverse: {
      control: { type: 'boolean' }
    }
  },
  args: {
    entries: ['foo', 'bar', 'baz', 'qux', 'quux', 'corge', 'grault', 'garply', 'waldo', 'fred', 'plugh', 'xyzzy'],
    reverse: false
  },
  render: args => ({
    components: {
      BButton,
      ParentOverflowEntries
    },
    setup: () => ({ args }),
    template: `
        <parent-overflow-entries v-bind="args" class="border rounded p-1">
          <template #entry="{ entry }">
            <b-button variant="light" size="sm" class="px-3">
              {{entry}}
            </b-button>
          </template>
          <template #separator>
            <span class="mx-1 text-secondary">
              &#8250;
            </span>
          </template>
        </parent-overflow-entries>
        <p class="fst-italic py-3">Try to resize the window.</p>
    `
  })
}

export const Default = {}

export const Reversed = {
  args: {
    reverse: true,
    entries: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    dropdownToggleClass: 'btn-sm me-1 border-0'
  }
}

export const WithSlots = {
  args: {
    reverse: false,
    entries: [],
    dropdownToggleClass: 'btn-sm'
  },
  render: args => ({
    components: {
      BButton,
      BDropdownItem,
      ParentOverflowEntries,
      ParentOverflowEntriesItem
    },
    setup: () => ({ args }),
    template: `
        <parent-overflow-entries v-bind="args" class="border rounded p-1">
          <parent-overflow-entries-item label="Datashare">
            <b-button variant="light" size="sm" class="me-1">
              Datashare
            </b-button>
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="Tasks">
            <b-button variant="light" size="sm" class="me-1">
              Tasks
            </b-button>
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="Batch searches">
            <b-button variant="light" size="sm" class="me-1">
              Batch searches
            </b-button>
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="Office of Foreign Assets Control (OFAC)">
            <b-button variant="light" size="sm" class="me-1">
              Office of Foreign Assets Control (OFAC)
            </b-button>
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="Lorem ipsum INC">
            <b-button variant="light" size="sm" class="me-1">
              Lorem ipsum INC
            </b-button>
          </parent-overflow-entries-item>
        </parent-overflow-entries>
        <p class="fst-italic py-3">Try to resize the window.</p>
    `
  })
}

export const WithSlotsReversed = {
  args: {
    reverse: true,
    entries: [],
    dropdownToggleClass: 'btn-sm border-0 me-1'
  },
  render: args => ({
    components: {
      BButton,
      BDropdownItem,
      ParentOverflowEntries,
      ParentOverflowEntriesItem
    },
    setup: () => ({ args }),
    template: `
        <parent-overflow-entries v-bind="args" class="border rounded p-1" dropdown-button-icon="dots-three-outline">
          <parent-overflow-entries-item label="home">
            /<code class="p-1">home</code>/
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="ubuntu">
            <code class="p-1">ubuntu</code>/
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="vault">
            <code class="p-1">vault</code>/
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="banana-papers">
            <code class="p-1">banana-papers</code>/
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="apple-bees">
            <code class="p-1">apple-bees</code>/
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="v1">
            <code class="p-1">v1</code>/
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="foo">
            <code class="p-1">foo</code>/
          </parent-overflow-entries-item>
          <parent-overflow-entries-item label="bar">
            <code class="p-1">bar</code>
          </parent-overflow-entries-item>
          <template #dropdown-entry="{ entry }">
            <b-dropdown-item>
              {{ entry.exposed.label }}
            </b-dropdown-item>
          </template>
        </parent-overflow-entries>
        <p class="fst-italic py-3">Try to resize the window.</p>
    `
  })
}
