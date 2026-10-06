<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric.vue'
import ProjectUsersActions from '@/components/ProjectUsers/ProjectUsersActions.vue'
import ProjectUsersAdminPromotionModal from '@/components/ProjectUsers/ProjectUsersAdminPromotionModal.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'

import { useCore } from '@/composables/useCore.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { useToast } from '@/composables/useToast.js'
import { NO_ROLE, ROLE, ROLE_BIT, ROLE_LOWERCASE } from '@/enums/roles.js'
import ButtonReset from '@/components/Button/ButtonReset'
import useAuth from '@/composables/useAuth.js'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  project: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  query: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const core = useCore()
const { toast } = useToast()

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'asc' })
const showAdminModal = ref(false)
const saving = ref(false)

const pendingChanges = ref({})

const emit = defineEmits(['roles:saved'])

const adminPromotions = computed(() =>
  Object.entries(pendingChanges.value)
    .filter(([uid, newRole]) => {
      const currentRole = props.users.find(u => u.uid === uid)?.role
      // Instance and domain admin can't be picked here, so project admin is the only promotion to confirm
      return newRole === ROLE.PROJECT_ADMIN && ROLE_BIT[newRole] > (ROLE_BIT[currentRole] ?? 0)
    })
    .map(([uid, newRole]) => ({ uid, newRole }))
)

const pendingCount = computed(() => Object.keys(pendingChanges.value).length)
const hasPendingChanges = computed(() => pendingCount.value > 0)

const fields = computed(() => [
  { key: 'uid', text: t('projectViewEdit.users.fields.uid.label'), sortable: true, emphasis: true },
  { key: 'name', text: t('projectViewEdit.users.fields.name.label'), sortable: true },
  { key: 'email', text: t('projectViewEdit.users.fields.email.label'), sortable: true },
  { key: 'role', text: t('projectViewEdit.users.fields.role.label'), sortable: true, thStyle: 'width: 16rem' }
])

async function saveRoles() {
  saving.value = true
  try {
    const entries = Object.entries(pendingChanges.value)
    const results = await Promise.allSettled(
      entries.map(([uid, role]) =>
        role === NO_ROLE
          ? core.api.revokeUserRole(uid, props.project, { ifExists: true })
          : core.api.grantUserRole(uid, props.project, ROLE_LOWERCASE[role])
      )
    )
    const succeeded = entries.filter((_, index) => results[index].status === 'fulfilled')
    const failed = entries.filter((_, index) => results[index].status === 'rejected')

    pendingChanges.value = Object.fromEntries(failed)

    if (failed.length > 0) {
      toast.error(t('projectViewEdit.users.roleSelect.saveError'))
    }
    else {
      toast.success(t('projectViewEdit.users.roleSelect.saveSuccess'))
    }

    // Grants and revocations alike: the parent refreshes the page
    if (succeeded.length > 0) {
      emit('roles:saved')
    }
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
function onRoleChanged(uid, role) {
  const original = props.users.find(u => u.uid === uid)?.role
  const next = { ...pendingChanges.value }
  if (role === original) {
    delete next[uid]
  }
  else {
    next[uid] = role
  }
  pendingChanges.value = next
}
const emptyLabel = computed(() =>
  props.query
    ? t('projectViewEdit.users.noResults')
    : t('projectViewEdit.users.empty')
)

// "No role" is how someone is removed from the project (saveRoles revokes it), and the current
// value of a user listed without one. Only offered when datashare owns the accounts (form/basic):
// under OAuth, project roles come from the identity provider and a revoke would not stick.
const { isCurrentUser, isAuthWithUsersProvider } = useAuth()
const { getRoleByProject, hasRole, isDomainAdmin } = usePolicies()
const viewerRole = computed(() => getRoleByProject(props.project))
// The viewer's own row is read-only: a project admin dropping their own role would lose access to
// this tab with nobody able to undo it. A domain or instance admin keeps access through their
// domain-wide role, so their own row stays editable.
function isLockedOwnRow(uid) {
  return !isDomainAdmin.value && isCurrentUser(uid)
}
// A user with no role on the project (listed so they can be added) outranks nobody: NO_ROLE has
// no ROLE_BIT, which hasRole would otherwise read as out of reach for every viewer.
function outranksViewer(role) {
  return role !== NO_ROLE && !hasRole(viewerRole.value, role)
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
    <page-table-generic
      v-model:sort="sort"
      v-model:order="order"
      :items="users"
      :fields="fields"
      :loading="loading"
      primary-key="uid"
    >
      <template #cell(uid)="{ item }">
        <display-user :value="item.uid" />
      </template>
      <template #cell(role)="{ item }">
        <!-- An instance or domain admin role gives access to every project of its scope, making
             any project-specific grant redundant: show only that highest rank, read-only, rather
             than a dropdown that can't actually change the user's access to this project. -->
        <instance-users-role-badge
          v-if="item.wideRoles?.length"
          :role="item.wideRoles[0]"
        />
        <project-users-role-dropdown
          v-else
          :disabled="isLockedOwnRow(item.uid) || outranksViewer(item.role)"
          :model-value="pendingChanges[item.uid] ?? item.role"
          :dirty="!!pendingChanges[item.uid]"
          :project="project"
          :no-role="isAuthWithUsersProvider"
          :hidden-roles="[ROLE.DOMAIN_ADMIN, ROLE.INSTANCE_ADMIN]"
          @update:model-value="onRoleChanged(item.uid, $event)"
        />
      </template>
      <template #row-actions="{ item }">
        <project-users-actions :user="item" />
      </template>
      <template #empty>
        <p class="text-secondary small m-3">
          {{ emptyLabel }}
        </p>
      </template>
    </page-table-generic>
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
