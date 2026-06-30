<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import PageTable from '@/components/PageTable/PageTable.vue'
import PageTableTh from '@/components/PageTable/PageTableTh.vue'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersAdminPromotionModal from '@/components/ProjectUsers/ProjectUsersAdminPromotionModal.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'

import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { ROLE, ROLE_BIT } from '@/enums/roles.js'
import ButtonReset from '@/components/Button/ButtonReset'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  project: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const core = useCore()
const { toast } = useToast()

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'asc' })
const query = defineModel('query', { type: String, default: '' })
const showAdminModal = ref(false)
const saving = ref(false)

const pendingChanges = ref({})

/*
watch(() => props.users, (newUsers) => {
  localUsers.value = newUsers.map(u => ({ ...u }))
}, { deep: true })
*/

const emit = defineEmits(['user:deleted'])

const ADMIN_ROLES = new Set([ROLE.PROJECT_ADMIN, ROLE.DOMAIN_ADMIN, ROLE.INSTANCE_ADMIN])

const adminPromotions = computed(() =>
  Object.entries(pendingChanges.value)
    .filter(([name, newRole]) => {
      const currentRole = props.users.find(u => u.name === name)?.role
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
        core.api.saveProjectPolicy('default', props.project, { user: name, role })
      )
    )
    Object.entries(pendingChanges.value).forEach(([name, role]) => {
      const user = props.users.find(u => u.name === name)
      if (user) user.role = role
    })
    pendingChanges.value = {}
    toast.success(t('projectViewEdit.users.roleSelect.saveSuccess'))
  }
  catch {
    pendingChanges.value = {}
    toast.error(t('projectViewEdit.users.roleSelect.saveError'))
  }
  finally {
    saving.value = false
  }
}

function cancelChanges() {
  pendingChanges.value = {}
}

function onSaveClicked() {
  if (adminPromotions.value.length > 0) {
    showAdminModal.value = true
  }
  else {
    saveRoles()
  }
}
function onRoleChanged(name, role) {
  const original = props.users.find(u => u.name === name)?.role
  const next = { ...pendingChanges.value }
  if (role === original) {
    delete next[name]
  }
  else {
    next[name] = role
  }
  pendingChanges.value = next
}
const emptyLabel = computed(() =>
  query.value
    ? t('projectViewEdit.users.noResults')
    : t('projectViewEdit.users.empty')
)

function onUserDeleted({ name }) {
  emit('user:deleted', { name })
}

defineExpose({ pendingChanges, saving, showAdminModal, saveRoles, cancelChanges, onSaveClicked })
</script>

<template>
  <div class="project-users-list">
    <project-users-admin-promotion-modal
      v-model="showAdminModal"
      :promotions="adminPromotions"
      @confirm="saveRoles"
    />
    <empty-state
      v-if="users.length === 0"
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
        v-for="(user, index) in users"
        :key="user.name ?? index"
      >
        <td><display-user :value="user.name" /></td>
        <td>
          <project-users-role-dropdown
            :model-value="pendingChanges[user.name] ?? user.role"
            :dirty="!!pendingChanges[user.name]"
            :project="project"
            @update:model-value="onRoleChanged(user.name, $event)"
          />
        </td>
        <td>
          <project-users-actions
            :user="user"
            :project="project"
            @user:deleted="onUserDeleted"
          />
        </td>
      </tr>
    </page-table>
    <div
      v-if="hasPendingChanges"
      class="project-users-list__sticky-bar d-flex justify-content-end align-items-center gap-2 p-3"
    >
      <span class="text-secondary ">
        {{ t('projectViewEdit.users.roleSelect.changedCount', pendingCount, { count: pendingCount }) }}
      </span>
      <button-reset
        :disabled="saving"
        @click="cancelChanges"
      >
        {{ t('projectViewEdit.users.roleSelect.cancel') }}
      </button-reset>

      <button-icon
        variant="action"
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
