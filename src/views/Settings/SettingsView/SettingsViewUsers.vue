<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'

import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import SettingsViewUsersCreateModal from '@/views/Settings/SettingsView/SettingsViewUsersCreateModal.vue'
import InstanceUsersList from '@/components/InstanceUsers/InstanceUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import { useAuth } from '@/composables/useAuth'
import { usePolicies } from '@/composables/usePolicies'
import { useToast } from '@/composables/useToast.js'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore.js'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore.js'
import { useUrlParam } from '@/composables/useUrlParam.js'
import { useUrlPageParam } from '@/composables/useUrlPageParam.js'
import { useAppStore } from '@/store/modules'
import { useWait } from '@/composables/useWait.js'
import { apiInstance as api } from '@/api/apiInstance.js'
import IPhPlus from '~icons/ph/plus'
import { ButtonIcon } from '@icij/murmur'

/**
 * A page to manage instance users.
 */
defineOptions({ name: 'SettingsViewUsers' })

const { t } = useI18n()
const { isAuthWithUsersProvider } = useAuth()
const { isDomainAdmin } = usePolicies()
const { toastedPromise } = useToast()
const appStore = useAppStore()
const { waitFor, isLoading } = useWait()

// Defense in depth: the tab itself is hidden for non domain/instance-admins, but the
// route can still be reached directly, so gate the view's content too.
const canManageUsers = computed(() => isAuthWithUsersProvider.value && isDomainAdmin.value)

const VIEW = 'instanceUsersList'
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

const showCreateModal = ref(false)
function onUserCreated() {
  fetchUsers()
}
// A role grant/revoke fires this while the roles modal stays open (it doesn't close itself
// after each change, unlike create/edit/delete). Routing it through the loading-wrapped
// fetchUsers() would flip `isLoading`, which makes PageTable swap its whole tbody for a
// skeleton placeholder -- unmounting every row (and the open modal's local state with it).
// Refresh the row data quietly instead, without touching the loading flag.
function onUserUpdated() {
  toastedPromise(retrieveUsers(), { errorMessage: errorMessage.value }).catch(() => {})
}

function onUserDeleted() {
  if (page.value > 1 && users.value.length === 1) {
    page.value -= 1
  }
  else {
    fetchUsers()
  }
}

const errorMessage = computed(() => t('settings.users.fetchError'))

const retrieveUsers = async () => {
  const from = (page.value - 1) * Number(perPage.value)
  const { items, pagination } = await api.getUsers({
    domain: DEFAULT_DOMAIN,
    index: null,
    noRole: isAuthWithUsersProvider.value,
    q: queryInput.value || null,
    sort: sort.value,
    desc: order.value === 'desc',
    from,
    size: Number(perPage.value)
  })
  users.value = items ?? []
  totalRows.value = pagination?.total ?? 0
}
const fetchUsers = waitFor(() =>
  toastedPromise(retrieveUsers(), { errorMessage: errorMessage.value }).catch(() => {})
)
const debouncedFetchUsers = debounce(fetchUsers, 200)

let skipNextPageWatch = false

function resetToFirstPage() {
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

onMounted(() => {
  if (isDomainAdmin.value) fetchUsers()
})
</script>

<template>
  <settings-view-layout class="settings-view-users">
    <p v-if="!isDomainAdmin">
      {{ t('settings.users.noAccess') }}
    </p>
    <div
      v-else
      class="d-flex flex-column gap-2"
    >
      <div class="d-flex justify-content-end">
        <button-icon
          v-if="canManageUsers"

          :icon-right="IPhPlus"
          @click="showCreateModal = true"
        >
          {{ t('settings.users.add.button') }}
        </button-icon>
      </div>
      <settings-view-users-create-modal
        v-model="showCreateModal"
        @user:created="onUserCreated"
      />
      <div class="d-flex justify-content-between flex-grow-1">
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
      <instance-users-list
        v-model:sort="sort"
        v-model:order="order"
        :query="queryInput"
        :users="users"
        :loading="isLoading"
        @user:updated="onUserUpdated"
        @user:deleted="onUserDeleted"
      />
    </div>
  </settings-view-layout>
</template>
