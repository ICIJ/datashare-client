<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import InstanceUsersActions from '@/components/InstanceUsers/InstanceUsersActions.vue'
import InstanceUsersRoleBadges from '@/components/InstanceUsers/InstanceUsersRoleBadges.vue'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric.vue'
import { ROLE, ROLE_BIT } from '@/enums/roles.js'

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
  }
})

const emit = defineEmits(['user:updated', 'user:deleted'])

const { t } = useI18n()

function onUserUpdated({ uid }) {
  emit('user:updated', { uid })
}

function onUserDeleted({ uid }) {
  emit('user:deleted', { uid })
}

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

// One badge per grant, highest role first. Domain admin is left out for now: it has no single
// project to badge (its identity is a domain), and the domain tier isn't part of this table yet.
function roleBadgesForPermissions(permissions) {
  return (permissions ?? [])
    .filter(({ v1: role }) => role !== ROLE.DOMAIN_ADMIN)
    .map(({ v1: role, v2 }) => ({ role, project: role === ROLE.INSTANCE_ADMIN ? null : String(v2).split('::')[1] }))
    .filter(({ role, project }) => role === ROLE.INSTANCE_ADMIN || (project && project !== '*'))
    .sort((a, b) => (ROLE_BIT[b.role] ?? 0) - (ROLE_BIT[a.role] ?? 0))
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
        <instance-users-role-badges :roles="item.roles" />
      </template>
      <template #row-actions="{ item }">
        <instance-users-actions
          :user="item"
          @user:updated="onUserUpdated"
          @user:deleted="onUserDeleted"
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
