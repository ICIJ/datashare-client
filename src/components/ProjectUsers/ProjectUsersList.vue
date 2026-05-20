<script setup>
import { computed, ref } from 'vue'
import { orderBy } from 'lodash'
import { useI18n } from 'vue-i18n'

import DisplayRole from '@/components/Display/DisplayRole.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import PageTable from '@/components/PageTable/PageTable.vue'
import PageTableTh from '@/components/PageTable/PageTableTh.vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const sort = ref(null)
const order = ref('asc')
const query = ref('')

const filteredUsers = computed(() => {
  if (!query.value) return props.users
  const q = query.value.toLowerCase()
  return props.users.filter(u => u.name?.toLowerCase().includes(q))
})

const sortedUsers = computed(() => {
  if (!sort.value) return filteredUsers.value
  return orderBy(filteredUsers.value, [sort.value], [order.value])
})

const emptyLabel = computed(() =>
  query.value
    ? t('projectViewEdit.users.noResults')
    : t('projectViewEdit.users.empty')
)
</script>

<template>
  <div class="project-users-list">
    <form-control-search
      v-model="query"
      clear-text
      class="mb-3"
    />
    <empty-state
      v-if="sortedUsers.length === 0"
      :label="emptyLabel"
    />
    <page-table
      v-else
      v-model:sort="sort"
      v-model:order="order"
    >
      <template #thead>
        <page-table-th
          emphasis
          sortable
          name="name"
          :label="t('projectViewEdit.users.fields.name.label')"
        />
        <page-table-th
          sortable
          name="role"
          :label="t('projectViewEdit.users.fields.role.label')"
        />
      </template>
      <tr
        v-for="(user, index) in sortedUsers"
        :key="user.name ?? index"
      >
        <td>{{ user.name }}</td>
        <td><display-role :value="user.role" /></td>
      </tr>
    </page-table>
  </div>
</template>
