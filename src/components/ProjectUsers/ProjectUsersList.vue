<script setup>
import { computed, ref, watch } from 'vue'
import { orderBy } from 'lodash'
import { useI18n } from 'vue-i18n'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import PageTable from '@/components/PageTable/PageTable.vue'
import PageTableTh from '@/components/PageTable/PageTableTh.vue'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersRoleSelect from '@/components/ProjectUsers/ProjectUsersRoleSelect.vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  projectName: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const sort = ref(null)
const order = ref('asc')
const query = ref('')

const localUsers = ref([...props.users])

watch(() => props.users, (newUsers) => {
  localUsers.value = [...newUsers]
}, { deep: true })

function onRoleSaved({ name, role }) {
  const user = localUsers.value.find(u => u.name === name)
  if (user) user.role = role
}

function onUserDeleted({ name }) {
  localUsers.value = localUsers.value.filter(u => u.name !== name)
}

const filteredUsers = computed(() => {
  if (!query.value) return localUsers.value
  const q = query.value.toLowerCase()
  return localUsers.value.filter(u => u.name?.toLowerCase().includes(q))
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
          style="width: 16rem"
          :label="t('projectViewEdit.users.fields.role.label')"
        />
        <page-table-th compact />
      </template>
      <tr
        v-for="(user, index) in sortedUsers"
        :key="user.name ?? index"
      >
        <td><display-user :value="user.name" /></td>
        <td>
          <project-users-role-select
            :user="user"
            :project-name="projectName"
            @role:saved="onRoleSaved"
          />
        </td>
        <td>
          <project-users-actions
            :user="user"
            :project-name="projectName"
            @user:deleted="onUserDeleted"
          />
        </td>
      </tr>
    </page-table>
  </div>
</template>
