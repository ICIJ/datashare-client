<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import SettingsViewUsersCreateModal from '@/views/Settings/SettingsView/SettingsViewUsersCreateModal.vue'
import SettingsViewUsersDeleteModal from '@/views/Settings/SettingsView/SettingsViewUsersDeleteModal.vue'
import SettingsViewUsersEditModal from '@/views/Settings/SettingsView/SettingsViewUsersEditModal.vue'
import SettingsViewUsersRolesModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesModal.vue'
import InstanceUsersList from '@/components/InstanceUsers/InstanceUsersList.vue'
import RowPaginationUsers from '@/components/RowPagination/RowPaginationUsers.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import { useAuth } from '@/composables/useAuth'
import { usePolicies } from '@/composables/usePolicies'
import { usePaginatedUsers } from '@/composables/usePaginatedUsers.js'
import { useToast } from '@/composables/useToast.js'
import { DEFAULT_DOMAIN } from '@/enums/roles.js'
import { apiInstance as api } from '@/api/apiInstance.js'
import IPhPlus from '~icons/ph/plus'
import { ButtonIcon } from '@icij/murmur'

/**
 * A page to manage instance users.
 */
defineOptions({ name: 'SettingsViewUsers' })

const { t } = useI18n()
const { toast } = useToast()
const route = useRoute()
const router = useRouter()
const { isCurrentUser, isAuthWithUsersProvider } = useAuth()
const { isDomainAdmin, isInstanceAdmin } = usePolicies()

// Domain admins can list users and manage their roles, but creating, editing and deleting an
// account is instance-wide (the backend requires INSTANCE_ADMIN for all three).
const canManageUsers = computed(() => isAuthWithUsersProvider.value && isInstanceAdmin.value)

const { users, totalRows, sort, order, perPage, queryInput, page, isLoading, isListingUnsupported, fetchUsers, refreshUsers, whenUsersLoaded }
  = usePaginatedUsers('instanceUsersList', {
    errorMessage: () => t('settings.users.fetchError'),
    async load(params) {
      const { items, pagination } = await api.getUsers({ domain: DEFAULT_DOMAIN, index: null, noRole: true, ...params })
      return { items: items ?? [], total: pagination?.total ?? 0 }
    }
  })

// Every modal lives in the URL so it can be linked to directly: /settings/users/create, or
// /settings/users/(edit|manage|delete)/<uid>. Closing one goes back to the plain list, keeping
// its query (search, page, sort).
const action = computed(() => route.params.action || null)
const routedUid = computed(() => route.params.uid || null)

function openModal(action, uid) {
  router.push({ name: 'settings.users', params: { action, uid }, query: route.query })
}

function closeModal() {
  router.push({ name: 'settings.users', query: route.query })
}

// The route also matches /settings/users/(edit|manage|delete) without a uid, which can't open
// anything: send it back to the plain list rather than leave that URL in the address bar.
watch(
  [action, routedUid],
  ([action, uid]) => {
    if (action && action !== 'create' && !uid) {
      router.replace({ name: 'settings.users', query: route.query })
    }
  },
  { immediate: true }
)

function modalModel(name, isAllowed = () => true) {
  return computed({
    get: () => action.value === name && isAllowed(),
    set: value => (value ? openModal(name, routedUid.value) : closeModal())
  })
}

const routedUser = ref(null)
const routedUserUid = ref(null)
const isRoutedUserReady = () => !!routedUid.value && routedUserUid.value === routedUid.value
const isRoutedUserNotFound = computed(() => isRoutedUserReady() && !routedUser.value)
const modalUser = computed(() => routedUser.value ?? { uid: routedUid.value, permissions: [] })

async function fetchRoutedUser() {
  const uid = routedUid.value
  if (!uid) return
  try {
    // An exact uid lookup: a q search would return every user whose uid merely contains this one,
    // and on a large instance the user we want could fall outside the page.
    const { items } = await api.getUsers({ domain: DEFAULT_DOMAIN, noRole: true, uid })
    if (uid !== routedUid.value) return
    routedUser.value = items?.[0] ?? null
    routedUserUid.value = uid
  }
  catch (error) {
    // A failed lookup says nothing about whether the user exists: report it and close the modal
    // rather than show "does not exist". A 501 means the users provider can't look anyone up.
    if (uid !== routedUid.value) return
    const unsupported = error?.response?.status === 501
    toast.error(t(unsupported ? 'settings.users.listUnsupported' : 'settings.users.fetchError'))
    closeModal()
  }
}
// Forget the previous lookup whenever the URL names another user (or none), so reopening a modal
// always waits for fresh data instead of showing what was cached before the last edit. Refreshes
// for the same uid (onRoutedUserUpdated) keep it, so an open modal doesn't close while refetching.
// The first lookup runs from onMounted, after the list request it can reuse has started.
watch(routedUid, () => {
  routedUser.value = null
  routedUserUid.value = null
  resolveRoutedUser()
})

async function resolveRoutedUser() {
  const uid = routedUid.value
  if (!uid || !isDomainAdmin.value) return
  await whenUsersLoaded().catch(() => {})
  if (uid !== routedUid.value) return
  const listed = users.value.find(user => user.uid === uid)
  if (!listed) return fetchRoutedUser()
  routedUser.value = listed
  routedUserUid.value = uid
}

const showCreateModal = modalModel('create', () => canManageUsers.value)
const showRolesModal = modalModel('manage', () => isDomainAdmin.value && isRoutedUserReady())
const showEditModal = modalModel('edit', () => canManageUsers.value && isRoutedUserReady())

const showDeleteModal = modalModel('delete', () => canManageUsers.value && isRoutedUserReady() && !isCurrentUser(routedUid.value))

function onUserCreated({ uid }) {
  if (!isListingUnsupported.value) openModal('manage', uid)
  fetchUsers()
}

function onRoutedUserUpdated() {
  refreshUsers()
  resolveRoutedUser()
}

// Steps back a page only when the deleted user was the last row of this page
function onUserDeleted({ uid }) {
  if (page.value > 1 && users.value.length === 1 && users.value[0].uid === uid) {
    page.value -= 1
  }
  else {
    fetchUsers()
  }
}

onMounted(() => {
  if (!isDomainAdmin.value) return
  fetchUsers()
  resolveRoutedUser()
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
      <settings-view-users-roles-modal
        v-model="showRolesModal"
        :user="modalUser"
        :not-found="isRoutedUserNotFound"
        @user:updated="onRoutedUserUpdated"
      />
      <settings-view-users-edit-modal
        v-model="showEditModal"
        :user="modalUser"
        :not-found="isRoutedUserNotFound"
        @user:updated="onRoutedUserUpdated"
      />
      <settings-view-users-delete-modal
        v-model="showDeleteModal"
        :user="modalUser"
        :not-found="isRoutedUserNotFound"
        @user:deleted="onUserDeleted"
      />
      <p
        v-if="isListingUnsupported"
        class="settings-view-users__unsupported text-secondary"
      >
        {{ t('settings.users.listUnsupported') }}
      </p>
      <template v-else>
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
            :placeholder="t('settings.users.searchPlaceholder')"
          />
        </div>
        <instance-users-list
          v-model:sort="sort"
          v-model:order="order"
          :query="queryInput"
          :users="users"
          :loading="isLoading"
          :can-manage-accounts="canManageUsers"
          @open="({ action, uid }) => openModal(action, uid)"
        />
      </template>
    </div>
  </settings-view-layout>
</template>
