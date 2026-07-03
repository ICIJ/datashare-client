<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce } from 'lodash'

import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useToast } from '@/composables/useToast.js'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore.js'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore.js'
import { useUrlParam } from '@/composables/useUrlParam.js'
import { useUrlPageParam } from '@/composables/useUrlPageParam.js'
import { useAppStore } from '@/store/modules'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import IPhUserPlus from '~icons/ph/user-plus'
import { apiInstance as api } from '@/api/apiInstance.js'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const { toast } = useToast()
const { t } = useI18n()
const { isUsersProvider } = useAuth()
const appStore = useAppStore()

const VIEW = 'projectUsersList'
const DEFAULT_DOMAIN = 'default'

const users = ref([])
const loading = ref(false)
const totalRows = ref(0)

const sortOrder = useUrlParamsWithStore(['sort', 'order'], {
  get: () => appStore.getSettings(VIEW, 'orderBy'),
  set: (sort, order) => appStore.setSettings(VIEW, { orderBy: [sort, order] })
})
const sort = computed({
  get: () => sortOrder.value?.[0] ?? null,
  set: value => (sortOrder.value = [value, order.value])
})
const order = computed({
  get: () => sortOrder.value?.[1] ?? 'asc',
  set: value => (sortOrder.value = [sort.value, value])
})
const perPage = useUrlParamWithStore('perPage', {
  transform: value => Math.max(10, parseInt(value)),
  get: () => appStore.getSettings(VIEW, 'perPage'),
  set: perPage => appStore.setSettings(VIEW, { perPage })
})
const query = useUrlParam('q', '')
const page = useUrlPageParam()

function roleForCurrentProject(permissions) {
  const permission = (permissions ?? []).find(({ v2 }) => v2 === `${DEFAULT_DOMAIN}::${props.name}`)
  return permission?.v1 ?? null
}

async function fetchUsers() {
  loading.value = true
  try {
    const from = (page.value - 1) * Number(perPage.value)
    const { items, pagination } = await api.getUsers({
      domain: DEFAULT_DOMAIN,
      project: props.name,
      user: query.value || null,
      sort: sort.value,
      desc: order.value === 'desc',
      from,
      size: Number(perPage.value)
    })
    users.value = (items ?? []).map(({ uid, name, email, permissions }) => ({
      login: uid,
      name: name ?? '',
      email: email ?? '',
      role: roleForCurrentProject(permissions)
    }))
    totalRows.value = pagination?.total ?? 0
  }
  catch {
    toast.error(t('projectViewEdit.users.fetchError'))
  }
  finally {
    loading.value = false
  }
}

const debouncedFetchUsers = debounce(fetchUsers, 200)

let skipNextPageWatch = false

function resetToFirstPage() {
  loading.value = true
  if (page.value !== 1) {
    skipNextPageWatch = true
    page.value = 1
  }
  debouncedFetchUsers()
}

watch(query, resetToFirstPage)
watch(perPage, resetToFirstPage)

watch(page, () => {
  if (skipNextPageWatch) {
    skipNextPageWatch = false
    return
  }
  fetchUsers()
})

const showCreateModal = ref(false)

function onUserCreated() {
  fetchUsers()
}

function onUserDeleted() {
  fetchUsers()
}

onMounted(fetchUsers)

</script>

<template>
  <div class="project-view-edit-users p-4">
    <div class="d-flex flex-column gap-2 mb-3">
      <div
        v-if="isUsersProvider"
        class="d-flex justify-content-end"
      >
        <button-icon
          :icon-left="IPhUserPlus"
          variant="action"
          class=" d-flex "
          @click="showCreateModal = true"
        >
          {{ t('projectViewEdit.users.create.button') }}
        </button-icon>
      </div>
      <div class="d-flex justify-content-between  flex-grow-1 ">
        <row-pagination-users
          v-model:page="page"
          :total-rows="totalRows"
          :per-page="perPage"
          class="d-flex"
        />
        <form-control-search
          v-model="query"
          clear-text
        />
      </div>
    </div>
    <project-users-create-modal
      v-model="showCreateModal"
      :project="name"
      @user:created="onUserCreated"
    />
    <project-users-list
      v-model:query="query"
      v-model:sort="sort"
      v-model:order="order"
      :users="users"
      :project="name"
      :loading="loading"
      @user:deleted="onUserDeleted"
    />
  </div>
</template>
