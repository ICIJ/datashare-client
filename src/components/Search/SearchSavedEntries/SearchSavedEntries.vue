<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayUser from '@/components/Display/DisplayUser'
import SearchSavedEntriesRowActions from '@/components/Search/SearchSavedEntries/SearchSavedEntriesRowActions'
import SearchSavedEntriesRowDetails from '@/components/Search/SearchSavedEntries/SearchSavedEntriesRowDetails'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })
const { t } = useI18n()

defineProps({
  events: {
    type: Array
  }
})

const fields = [
  {
    value: 'name',
    icon: 'list-checks',
    text: computed(() => t('searchSavedEntries.fields.name')),
    sortable: true,
    emphasis: true
  },
  {
    value: 'user',
    icon: 'user-circle',
    text: computed(() => t('searchSavedEntries.fields.author')),
  },
  {
    value: 'creation_date',
    icon: 'calendar-blank',
    text: computed(() => t('searchSavedEntries.fields.creationDate')),
    sortable: true
  }
]

function searchParamsFromURI(uri) {
  return new URLSearchParams(uri.split('?').slice(1).pop())
}

function searchParamsQuery(uri) {
  return Object.fromEntries(searchParamsFromURI(uri))
}
</script>

<template>
  <page-table-generic primary-key="id" v-model:sort="sort" v-model:order="order" :items="events" :fields="fields" show-row-details>
    <template #cell(name)="{ item }">
      <router-link :to="{ name: 'search', query: searchParamsQuery(item.uri) }" class="fw-medium">
        {{ item.name }}
      </router-link>
    </template>
    <template #cell(user)="{ item }">
      <display-user :value="item.user.id" />
    </template>
    <template #cell(creation_date)="{ item }">
      <display-datetime :value="item.creationDate" />
    </template>
    <template #row-actions="{ item, detailsShowing, toggleDetails }">
      <search-saved-entries-row-actions :details-showing="detailsShowing" @toggle="toggleDetails" :event="item" />
    </template>
    <template #row-details="{ item }">
      <search-saved-entries-row-details :event="item" />
    </template>
  </page-table-generic>
</template>
