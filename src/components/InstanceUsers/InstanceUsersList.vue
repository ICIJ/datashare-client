<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import InstanceUsersActions from '@/components/InstanceUsers/InstanceUsersActions.vue'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric.vue'
import ProjectsButton from '@/components/Project/ProjectsButton.vue'

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
  { key: 'projects', text: t('settings.users.fields.projects.label') }
])

const emptyLabel = computed(() =>
  props.query
    ? t('settings.users.noResults')
    : t('settings.users.empty')
)

// A user's permissions are "<domain>::<project>" pairs (e.g. "default::my-project").
// Resolve the distinct non-wildcard projects they're granted a role on.
function projectsForPermissions(permissions) {
  const projects = (permissions ?? [])
    .map(({ v2 }) => String(v2).split('::')[1])
    .filter(project => project && project !== '*')
  return [...new Set(projects)]
}

const items = computed(() =>
  props.users.map(user => ({ ...user, projects: projectsForPermissions(user.permissions) }))
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
      <template #cell(projects)="{ item }">
        <projects-button :projects="item.projects" />
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
