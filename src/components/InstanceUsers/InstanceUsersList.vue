<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import InstanceUsersActions from '@/components/InstanceUsers/InstanceUsersActions.vue'
import InstanceUsersRoleBadges from '@/components/InstanceUsers/InstanceUsersRoleBadges.vue'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric.vue'
import { useAuth } from '@/composables/useAuth.js'
import { compareGrants, isInstanceOrDomainRole, parsePermission } from '@/enums/roles.js'

defineOptions({ name: 'InstanceUsersList' })

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  query: {
    type: String,
    default: ''
  },
  canManageAccounts: {
    type: Boolean
  }
})

const emit = defineEmits(['open'])

const { t } = useI18n()
const { isCurrentUser } = useAuth()

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'asc' })

const fields = computed(() => [
  { key: 'uid', text: t('settings.users.fields.uid.label'), sortable: true, emphasis: true },
  { key: 'name', text: t('settings.users.fields.name.label'), sortable: true },
  { key: 'email', text: t('settings.users.fields.email.label'), sortable: true },
  { key: 'roles', text: t('settings.users.fields.role.label'), sortable: true, sortingKey: 'role' }
])

const emptyLabel = computed(() =>
  props.query
    ? t('settings.users.noResults')
    : t('settings.users.empty')
)

// One badge per grant, highest role first. Instance/domain admin have no single project to
// badge (their identity is instance/domain-wide), so InstanceUsersRoleBadge gets project: null.
function roleBadgesForPermissions(permissions) {
  return (permissions ?? [])
    .map(parsePermission)
    .filter(({ role, project }) => isInstanceOrDomainRole(role) || (project && project !== '*'))
    .sort(compareGrants)
    .map(({ role, project }) => ({ role, project: isInstanceOrDomainRole(role) ? null : project }))
}

const items = computed(() =>
  props.users.map(user => ({
    ...user,
    roles: roleBadgesForPermissions(user.permissions)
  }))
)
</script>

<template>
  <div class="instance-users-list">
    <page-table-generic
      v-model:sort="sort"
      v-model:order="order"
      :items="items"
      :fields="fields"
      :loading="loading"
      primary-key="uid"
    >
      <template #cell(uid)="{ item }">
        <display-user :value="item.uid" />
      </template>
      <template #cell(roles)="{ item }">
        <instance-users-role-badges
          :roles="item.roles"
          @more="emit('open', { action: 'manage', uid: item.uid })"
        />
      </template>
      <template #row-actions="{ item }">
        <instance-users-actions
          :user="item"
          :can-manage-account="canManageAccounts"
          :is-current-user="isCurrentUser(item.uid)"
          @open="emit('open', $event)"
        />
      </template>
      <template #empty>
        <p class="text-secondary small m-3">
          {{ emptyLabel }}
        </p>
      </template>
    </page-table-generic>
  </div>
</template>
