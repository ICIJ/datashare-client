<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import { useAuth } from '@/composables/useAuth.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { usePaginatedUsers } from '@/composables/usePaginatedUsers.js'
import { DEFAULT_DOMAIN, NO_ROLE, parsePermission, ROLE_BIT } from '@/enums/roles.js'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const { isAuthWithUsersProvider } = useAuth()
const { getHighestRoleFromList } = usePolicies()

// `role` is what the dropdown shows: the user's role on this very project, or no role. Instance and
// domain admin roles are returned apart as `wideRoles` (highest first: instance admin from "*::*",
// domain admin from this project's domain) and shown as badges.
function rolesForCurrentProject(permissions) {
  const recognized = (permissions ?? [])
    .map(parsePermission)
    .filter(({ domain, project }) => (domain === DEFAULT_DOMAIN || domain === '*') && (project === props.name || project === '*'))
    .filter(({ role }) => role in ROLE_BIT)
  const onThisProject = recognized.filter(({ project }) => project === props.name)
  const wide = recognized.filter(({ project }) => project === '*')
  return {
    role: onThisProject.length ? getHighestRoleFromList(onThisProject) : NO_ROLE,
    wideRoles: [...new Set(wide.map(({ role }) => role))].sort((a, b) => ROLE_BIT[b] - ROLE_BIT[a])
  }
}
const { users, totalRows, sort, order, perPage, queryInput, page, isLoading, isListingUnsupported, fetchUsers }
  = usePaginatedUsers('projectUsersList', {
    errorMessage: () => t('projectViewEdit.users.fetchError'),
    async load(params) {
      const { items, pagination } = await api.getUsers({
        domain: DEFAULT_DOMAIN,
        index: props.name,
        noRole: isAuthWithUsersProvider.value,
        ...params
      })
      const rows = (items ?? []).map(({ uid, name, email, permissions }) => ({
        uid,
        name: name ?? '',
        email: email ?? '',
        ...rolesForCurrentProject(permissions)
      }))
      return { items: rows, total: pagination?.total ?? 0 }
    }
  })

onMounted(fetchUsers)

</script>

<template>
  <div class="project-view-edit-users p-4">
    <p
      v-if="isListingUnsupported"
      class="project-view-edit-users__unsupported text-secondary"
    >
      {{ t('projectViewEdit.users.listUnsupported') }}
    </p>
    <template v-else>
      <div class="d-flex flex-column gap-2 mb-3">
        <div class="d-flex justify-content-between  flex-grow-1 ">
          <row-pagination-users
            v-model:page="page"
            :total-rows="totalRows"
            :per-page="perPage"
            class="d-flex"
          />
          <form-control-search
            v-model="queryInput"
            clear-text
          />
        </div>
      </div>
      <project-users-list
        v-model:sort="sort"
        v-model:order="order"
        :query="queryInput"
        :users="users"
        :project="name"
        :loading="isLoading"
        @roles:saved="fetchUsers"
      />
    </template>
  </div>
</template>
