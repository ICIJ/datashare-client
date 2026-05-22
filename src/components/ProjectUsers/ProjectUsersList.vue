<script setup>
import { computed, ref, watch } from 'vue'
import { orderBy } from 'lodash'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhUserPlus from '~icons/ph/user-plus'
import IPhFloppyDisk from '~icons/ph/floppy-disk'
import IPhX from '~icons/ph/x'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import PageTable from '@/components/PageTable/PageTable.vue'
import PageTableTh from '@/components/PageTable/PageTableTh.vue'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersAdminPromotionModal from '@/components/ProjectUsers/ProjectUsersAdminPromotionModal.vue'
import ProjectUsersCreateModal from '@/components/ProjectUsers/ProjectUsersCreateModal.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'

import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { ROLE, ROLE_BIT } from '@/enums/roles.js'

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
const core = useCore()
const { toast } = useToast()

const sort = ref(null)
const order = ref('asc')
const query = ref('')
const showCreateModal = ref(false)
const showAdminModal = ref(false)
const saving = ref(false)

const localUsers = ref(props.users.map(u => ({ ...u })))
const pendingChanges = ref({})

watch(() => props.users, (newUsers) => {
  localUsers.value = newUsers.map(u => ({ ...u }))
}, { deep: true })

function onRoleChanged(name, role) {
  const original = localUsers.value.find(u => u.name === name)?.role
  const next = { ...pendingChanges.value }
  if (role === original) {
    delete next[name]
  } else {
    next[name] = role
  }
  pendingChanges.value = next
}

function onUserDeleted({ name }) {
  localUsers.value = localUsers.value.filter(u => u.name !== name)
}

function onUserCreated({ name, role }) {
  localUsers.value.push({ name, role })
}

const ADMIN_ROLES = new Set([ROLE.PROJECT_ADMIN, ROLE.DOMAIN_ADMIN, ROLE.INSTANCE_ADMIN])

const adminPromotions = computed(() =>
  Object.entries(pendingChanges.value)
    .filter(([name, newRole]) => {
      const currentRole = localUsers.value.find(u => u.name === name)?.role
      return ADMIN_ROLES.has(newRole) && ROLE_BIT[newRole] > ROLE_BIT[currentRole]
    })
    .map(([name, newRole]) => ({ name, newRole }))
)

const pendingCount = computed(() => Object.keys(pendingChanges.value).length)
const hasPendingChanges = computed(() => pendingCount.value > 0)

async function saveRoles() {
  saving.value = true
  try {
    await Promise.all(
      Object.entries(pendingChanges.value).map(([name, role]) =>
        core.api.saveProjectPolicy('default', props.projectName, { user: name, role })
      )
    )
    Object.entries(pendingChanges.value).forEach(([name, role]) => {
      const user = localUsers.value.find(u => u.name === name)
      if (user) user.role = role
    })
    pendingChanges.value = {}
    toast.success(t('projectViewEdit.users.roleSelect.saveSuccess'))
  } catch {
    pendingChanges.value = {}
    toast.error(t('projectViewEdit.users.roleSelect.saveError'))
  } finally {
    saving.value = false
  }
}

function cancelChanges() {
  pendingChanges.value = {}
}

function onSaveClicked() {
  if (adminPromotions.value.length > 0) {
    showAdminModal.value = true
  } else {
    saveRoles()
  }
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

defineExpose({ localUsers, pendingChanges, saving, showAdminModal, saveRoles, cancelChanges, onSaveClicked })
</script>

<template>
  <div class="project-users-list">
    <div class="d-flex justify-content-end align-items-center gap-2 mb-3">
      <button-icon
        :icon-left="IPhUserPlus"
        size="sm"
        variant="primary"
        @click="showCreateModal = true"
      >
        {{ t('projectViewEdit.users.create.button') }}
      </button-icon>
      <form-control-search
        v-model="query"
        clear-text
        class="flex-grow-1"
      />
    </div>
    <project-users-create-modal
      v-model="showCreateModal"
      :project-name="projectName"
      @user:created="onUserCreated"
    />
    <project-users-admin-promotion-modal
      v-model="showAdminModal"
      :promotions="adminPromotions"
      @confirm="saveRoles"
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
          <project-users-role-dropdown
            :model-value="pendingChanges[user.name] ?? user.role"
            :dirty="!!pendingChanges[user.name]"
            :project-name="projectName"
            @update:model-value="onRoleChanged(user.name, $event)"
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
    <div
      v-if="hasPendingChanges"
      class="project-users-list__sticky-bar d-flex justify-content-end align-items-center gap-2 p-3"
    >
      <span class="text-secondary small">
        {{ t('projectViewEdit.users.roleSelect.changedCount', pendingCount, { count: pendingCount }) }}
      </span>
      <button-icon
        variant="outline-secondary"
        size="sm"
        :icon-left="IPhX"
        :disabled="saving"
        @click="cancelChanges"
      >
        {{ t('projectViewEdit.users.roleSelect.cancel') }}
      </button-icon>
      <button-icon
        variant="action"
        size="sm"
        :icon-left="IPhFloppyDisk"
        :disabled="saving"
        @click="onSaveClicked"
      >
        {{ t('projectViewEdit.users.roleSelect.save') }}
      </button-icon>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-users-list {
  &__sticky-bar {
    position: sticky;
    bottom: 0;
    background-color: var(--bs-body-bg);
    border-top: 1px solid var(--bs-border-color);
  }
}
</style>
