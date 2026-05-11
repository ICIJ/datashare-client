<script setup>
import { computed, ref } from 'vue'
import { orderBy } from 'lodash'
import { useI18n } from 'vue-i18n'

import DisplayRole from '@/components/Display/DisplayRole.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
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

const sortedUsers = computed(() => {
  if (!sort.value) return props.users
  return orderBy(props.users, [sort.value], [order.value])
})
</script>

<template>
  <div class="project-users-list">
    <empty-state
      v-if="users.length === 0"
      :label="t('projectViewEdit.users.empty')"
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
