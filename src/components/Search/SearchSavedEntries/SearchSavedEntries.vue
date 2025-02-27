<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayUser from '@/components/Display/DisplayUser'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric'

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

defineProps({
  events: {
    type: Array
  }
})

const fields = [
  {
    value: 'name',
    text: 'name'
  },
  {
    value: 'user',
    text: 'author'
  },
  {
    value: 'creation_date',
    text: 'creationDate'
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
  <page-table-generic 
    v-model:sort="sort"
    v-model:order="order"
    :items="events" 
    :fields="fields"
    show-row-details
  >
    <template #cell(name)="{ item }">
      <router-link :to="{ name: 'search', query: searchParamsQuery(item.uri) }">
        {{ item.name }}
      </router-link>
    </template>
    <template #cell(user)="{ item }">
      <display-user :value="item.user.id" />
    </template>
    <template #cell(creation_date)="{ item }">
      <display-datetime :value="item.creationDate" />
    </template>
    <template #row-actions="{ toggleDetails, detailsShowing }">
      <div class="d-flex gap-2">
        <button-icon
          :icon-left="detailsShowing.value ? PhCaretUp : PhCaretDown"
          icon-left-hover-weight="bold"
          hide-label
          square
          size="sm"
          variant="outline-secondary"
          label="Toggle details"
          @click="toggleDetails"
        />
      </div>
    </template>
    <template #row-details="{ item }">
      <div>
        <pre>{{ item }}</pre>
      </div>
    </template>
  </page-table-generic>
</template>