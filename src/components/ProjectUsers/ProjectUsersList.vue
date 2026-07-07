<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { orderBy as orderArrayBy } from 'lodash'
import { ButtonIcon } from '@icij/murmur-next'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric.vue'
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
  },
  loading: {
    type: Boolean,
    default: false
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
    .filter(([login, newRole]) => {
      const currentRole = props.users.find(u => u.login === login)?.role
      return ADMIN_ROLES.has(newRole) && ROLE_BIT[newRole] > ROLE_BIT[currentRole]
    })
    .map(([login, newRole]) => ({ login, newRole }))
)

const pendingCount = computed(() => Object.keys(pendingChanges.value).length)
const hasPendingChanges = computed(() => pendingCount.value > 0)

const sortedUsers = computed(() => orderArrayBy(props.users, [sort.value ?? 'login'], [order.value]))

const fields = computed(() => [
  { key: 'login', text: t('projectViewEdit.users.fields.login.label'), sortable: true, emphasis: true },
  { key: 'name', text: t('projectViewEdit.users.fields.name.label'), sortable: true },
  { key: 'email', text: t('projectViewEdit.users.fields.email.label'), sortable: true },
  { key: 'role', text: t('projectViewEdit.users.fields.role.label'), sortable: true, thStyle: 'width: 16rem' }
])

async function saveRoles() {
  saving.value = true
  try {
    await Promise.all(
      Object.entries(pendingChanges.value).map(([login, role]) =>
        core.api.saveProjectPolicy('default', props.project, { user: login, role })
      )
    )
    Object.entries(pendingChanges.value).forEach(([login, role]) => {
      const user = props.users.find(u => u.login === login)
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
function onRoleChanged(login, role) {
  const original = props.users.find(u => u.login === login)?.role
  const next = { ...pendingChanges.value }
  if (role === original) {
    delete next[login]
  }
  else {
    next[login] = role
  }
  pendingChanges.value = next
}
const emptyLabel = computed(() =>
  query.value
    ? t('projectViewEdit.users.noResults')
    : t('projectViewEdit.users.empty')
)

function onUserDeleted({ login }) {
  emit('user:deleted', { login })
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
      :items="sortedUsers"
      :fields="fields"
      :loading="loading"
      primary-key="login"
    >
      <template #cell(login)="{ item }">
        <display-user :value="item.login" />
      </template>
      <template #cell(role)="{ item }">
        <project-users-role-dropdown
          :model-value="pendingChanges[item.login] ?? item.role"
          :dirty="!!pendingChanges[item.login]"
          :project="project"
          no-role
          @update:model-value="onRoleChanged(item.login, $event)"
        />
      </template>
      <template #row-actions="{ item }">
        <project-users-actions
          :user="item"
          :project="project"
          @user:deleted="onUserDeleted"
        />
      </template>
      <template #empty>
        <p class="text-secondary small m-3">{{ emptyLabel }}</p>
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
