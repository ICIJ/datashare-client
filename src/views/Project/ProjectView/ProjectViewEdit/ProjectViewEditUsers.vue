<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { debounce, isEqual } from 'lodash'

import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useToast } from '@/composables/useToast.js'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore.js'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore.js'
import { useUrlParam } from '@/composables/useUrlParam.js'
import { useUrlPageParam } from '@/composables/useUrlPageParam.js'
import { useAppStore } from '@/store/modules'
import { NO_ROLE } from '@/enums/roles.js'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import IPhUserPlus from '~icons/ph/user-plus'
import { apiInstance as api } from '@/api/apiInstance.js'
import { useWait } from '@/composables/useWait.js'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const { toastedPromise } = useToast()
const { t } = useI18n()
const { isUsersProvider } = useAuth()
const appStore = useAppStore()
const { waitFor, isLoading, start, loaderId } = useWait()

const VIEW = 'projectUsersList'
const DEFAULT_DOMAIN = 'default'

const users = ref([])
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
const queryInput = ref(query.value)
watch(query, (value) => {
  if (value !== queryInput.value) queryInput.value = value
})

const page = useUrlPageParam()

function roleForCurrentProject(permissions) {
  const permission = (permissions ?? []).find(({ v2 }) => v2 === `${DEFAULT_DOMAIN}::${props.name}`)
  return permission?.v1 ?? NO_ROLE
}
const createUserButtonText = computed(() => t('projectViewEdit.users.create.button'))
const errorMessage = computed(() => t('projectViewEdit.users.fetchError'))

const retrieveUsers = async () => {
  const from = (page.value - 1) * Number(perPage.value)
  const { items, pagination } = await api.getUsers({
    domain: DEFAULT_DOMAIN,
    index: props.name,
    q: queryInput.value || null,
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
const fetchUsers = waitFor(() =>
  toastedPromise(retrieveUsers(), { errorMessage: errorMessage.value }).catch(() => {})
)
const debouncedFetchUsers = debounce(fetchUsers, 200)

let skipNextPageWatch = false

function resetToFirstPage() {
  start(loaderId)
  if (page.value !== 1) {
    skipNextPageWatch = true
    page.value = 1
  }
  debouncedFetchUsers()
}

watch(queryInput, (value) => {
  query.value = value
  resetToFirstPage()
})
watch(perPage, resetToFirstPage)
watch(sortOrder, (value, oldValue) => {
  if (!isEqual(value, oldValue)) fetchUsers()
})

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
          {{ createUserButtonText }}
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
          v-model="queryInput"
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
      v-model:sort="sort"
      v-model:order="order"
      :query="queryInput"
      :users="users"
      :project="name"
      :loading="isLoading"
      @user:deleted="onUserDeleted"
    />
  </div>
</template>
