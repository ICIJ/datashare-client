<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { parseQuery } from 'vue-router'

import IPhListChecks from '~icons/ph/list-checks'
import IPhCalendarBlank from '~icons/ph/calendar-blank'

import DisplayDatetime from '@/components/Display/DisplayDatetime'
import SearchSavedEntriesRowActions from '@/components/Search/SearchSavedEntries/SearchSavedEntriesRowActions'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import SearchBreadcrumbUri from '@/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri'
import { markSavedSearchOpened } from '@/composables/useSearchFilter'

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

defineProps({
  events: {
    type: Array
  }
})

const emit = defineEmits(['reload'])

const { t } = useI18n()

const fields = [
  {
    value: 'name',
    icon: IPhListChecks,
    text: computed(() => t('searchSavedEntries.fields.name')),
    sortable: true,
    emphasis: true
  },
  {
    value: 'creation_date',
    icon: IPhCalendarBlank,
    text: computed(() => t('searchSavedEntries.fields.creationDate')),
    sortable: true,
    colStyle: {
      width: '200px'
    }
  }
]

function searchParamsFromURI(uri) {
  return new URLSearchParams(uri.split('?').slice(1).pop())
}

function searchParamsQuery(uri) {
  return parseQuery(searchParamsFromURI(uri).toString())
}

// Marks the upcoming navigation as "opening a saved search" before actually
// triggering it (router-link's `custom` slot + explicit `navigate()` call
// guarantees this runs first), see markSavedSearchOpened's declaration for
// why a currently-active lock absent from this saved search must not be
// silently re-applied. icij/datashare#2331.
//
// Skip the mark on any click router-link's own navigate() would itself
// ignore (ctrl/cmd/shift/alt-click, middle-click, a non-primary button):
// navigate() no-ops in that case, so the flag would otherwise be left set
// with nothing left in this tab to consume it, silently starving the next
// unrelated search's locked-filter merge.
function openSavedSearch(navigate, event) {
  const isModifiedClick = event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
  const isNonPrimaryButton = event.button != null && event.button !== 0
  if (!isModifiedClick && !isNonPrimaryButton) {
    markSavedSearchOpened()
  }
  navigate(event)
}
</script>

<template>
  <page-table-generic
    v-model:sort="sort"
    v-model:order="order"
    primary-key="id"
    :items="events"
    :fields="fields"
    :actions-col-style="{ width: '200px' }"
    show-row-details
  >
    <template #cell(name)="{ item }">
      <router-link
        v-slot="{ navigate, href }"
        :to="{ name: 'search', query: searchParamsQuery(item.uri) }"
        custom
      >
        <a
          :href="href"
          class="fw-medium"
          @click="openSavedSearch(navigate, $event)"
        >
          {{ item.name }}
        </a>
      </router-link>
    </template>
    <template #cell(creation_date)="{ item }">
      <display-datetime :value="item.creationDate" />
    </template>
    <template #row-actions="{ item, detailsShowing, toggleDetails }">
      <search-saved-entries-row-actions
        :event="item"
        :toggle="detailsShowing"
        @update:toggle="toggleDetails"
        @edit="emit('reload')"
        @remove="emit('reload')"
      />
    </template>
    <template #row-details="{ item }">
      <search-breadcrumb-uri
        :uri="item.uri"
        no-label
        class="ps-5"
      />
    </template>
    <template #empty>
      {{ t('searchSavedEntries.empty') }}
    </template>
  </page-table-generic>
</template>
