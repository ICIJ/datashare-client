<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import debounce from 'lodash/debounce'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'
import PageTable from '@/components/PageTable/PageTable.vue'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions.vue'
import PageTableTh from '@/components/PageTable/PageTableTh.vue'
import PageTableTr from '@/components/PageTable/PageTableTr.vue'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'

import { useAuth } from '@/composables/useAuth.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { isInstanceOrDomainRole, NO_ROLE, ROLE, ROLE_BIT, ROLE_LOWERCASE } from '@/enums/roles.js'

// The wildcard project casbin uses to represent the instance-wide scope in this UI. Granting there
// goes through the dedicated PUT/DELETE /api/users/admin/:uid/role endpoint (grantInstanceRole/
// revokeInstanceRole), not the project-scoped /index/:index one.
const INSTANCE_SCOPE = '*'
// A synthetic scope-picker-only value: existing domain-admin grants still parse to project '*'
// (same as instance-admin, see `roles` below), but the add-row scope picker needs its own
// distinct entry so a viewer can grant a domain-admin role without going through "Instance".
// Never sent to the API directly, only used to pick which role changeRole/grantRole end up calling.
const DOMAIN_SCOPE = '**'
// Domain stays hardcoded here (no picker) since 'default' is the only domain that exists today;
// only matters for DOMAIN_ADMIN grants. INSTANCE_ADMIN is domain-less: the backend rejects the
// grant if a domain param is present at all, so it must be omitted rather than defaulted.
const DEFAULT_DOMAIN = 'default'
const PROJECT_ROLES = [ROLE.PROJECT_VISITOR, ROLE.PROJECT_MEMBER, ROLE.PROJECT_EDITOR, ROLE.PROJECT_ADMIN]
const INSTANCE_ROLES = [ROLE.DOMAIN_ADMIN, ROLE.INSTANCE_ADMIN]

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['user:updated'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const { isInstanceAdmin } = usePolicies()
// Under OAuth, project roles come from the identity provider's own groups and get overwritten
// on the next login, revoking one here wouldn't stick, so only the datashare-native
// instance/domain admin grant can be revoked from this UI in that mode.
const { isAuthWithUsersProvider } = useAuth()

const permissions = ref([])
const search = ref('')
// Filtering is a synchronous in-memory operation, but still debounced: it avoids re-filtering
// the list on every keystroke while the user is still typing.
const debouncedSearch = ref('')
const setDebouncedSearch = debounce(value => (debouncedSearch.value = value), 200)

// Sync the local permissions list from the user prop whenever the modal is opened for a different
// user. Guarded on uid rather than the object reference: refreshUser() rebuilds props.user with a
// fresh reference on every grant/revoke while the modal stays open, which would otherwise wipe the
// search box mid-session.
watch(() => props.user?.uid, (uid, previousUid) => {
  if (uid === previousUid) return
  permissions.value = props.user?.permissions ?? []
  search.value = ''
  setDebouncedSearch.cancel()
  debouncedSearch.value = ''
}, { immediate: true })

watch(search, setDebouncedSearch)

// Each permission is { v1: role, v2: 'domain::project' }. Domain is kept around in the parsed
// data for completeness, but this UI only ever renders `project` and `role`.
// Sorted by role rank (instance admin down to visitor), then A-Z within a tier: by domain for a
// domain-scoped row, by project name otherwise (instance rows are always alone at the top).
const roles = computed(() =>
  permissions.value
    .map(({ v1: role, v2 }) => {
      const [domain, project] = String(v2).split('::')
      return { domain, project, role }
    })
    .sort((a, b) => {
      const roleDiff = (ROLE_BIT[b.role] ?? 0) - (ROLE_BIT[a.role] ?? 0)
      if (roleDiff !== 0) return roleDiff
      const sortKeyOf = ({ project, domain }) => (project === INSTANCE_SCOPE ? domain : project)
      return sortKeyOf(a).localeCompare(sortKeyOf(b))
    })
)

// Filters the granted-roles table by project name, or by the "Instance" label for the
// instance-wide row, so a user with many project grants can find one without scrolling.
const filteredRoles = computed(() => {
  const query = debouncedSearch.value.trim().toLowerCase()
  if (!query) return roles.value
  return roles.value.filter(({ project }) => {
    const label = project === INSTANCE_SCOPE ? t('settings.users.rolesModal.scope.instance') : project
    return label.toLowerCase().includes(query)
  })
})

const assignedProjects = computed(() => new Set(roles.value.map(({ project }) => project)))
const availableProjects = computed(() => core.projects.filter(({ name }) => !assignedProjects.value.has(name)))
// Only offer each instance-wide entry if the viewer can actually grant it (redundant today since
// this whole page is already instance-admin-gated, but keeps this control safe on its own) and
// it isn't already granted. Checked by role rather than via assignedProjects, since instance and
// domain admin share the same project ('*') there.
const canGrantInstanceRole = computed(() => isInstanceAdmin.value && !roles.value.some(({ role }) => role === ROLE.INSTANCE_ADMIN))
const canGrantDomainRole = computed(() => isInstanceAdmin.value && !roles.value.some(({ role }) => role === ROLE.DOMAIN_ADMIN))
// Synthetic "projects" so the instance-wide/domain-wide scopes can live in the same picker as
// real projects, first in the list. ProjectThumbnail/ProjectLabel work off name/label alone, no
// real project record is required.
const instanceScopeEntry = computed(() => ({ name: INSTANCE_SCOPE, label: t('settings.users.rolesModal.scope.instance') }))
const domainScopeEntry = computed(() => ({ name: DOMAIN_SCOPE, label: t('settings.users.rolesModal.scope.domain') }))
const projectPickerOptions = computed(() => [
  ...(canGrantInstanceRole.value ? [instanceScopeEntry.value] : []),
  ...(canGrantDomainRole.value ? [domainScopeEntry.value] : []),
  ...availableProjects.value
])

const selectedProject = ref(null)
// Default to no role: force an explicit pick rather than silently pre-selecting one, since
// granting a role is a deliberate action.
const selectedRole = ref(NO_ROLE)
const selectedProjectName = computed(() => selectedProject.value?.name ?? null)
const isInstanceScope = computed(() => selectedProjectName.value === INSTANCE_SCOPE)
const isDomainScope = computed(() => selectedProjectName.value === DOMAIN_SCOPE)
// Project, instance and domain roles are mutually exclusive: a project grant can't be a
// domain/instance admin (no domain concept in grantUserRole yet, see DEFAULT_DOMAIN elsewhere),
// and each instance-wide scope only offers its own single role (an existing grant can still be
// swapped between the two via the per-row picker below, see changeRole).
const hiddenRolesFor = isInstance => (isInstance ? PROJECT_ROLES : INSTANCE_ROLES)
const hiddenRoles = computed(() => {
  if (isInstanceScope.value) return [...PROJECT_ROLES, ROLE.DOMAIN_ADMIN]
  if (isDomainScope.value) return [...PROJECT_ROLES, ROLE.INSTANCE_ADMIN]
  return INSTANCE_ROLES
})

// A grant needs an actual role picked; NO_ROLE is the unselected/default state.
const canGrant = computed(() => !!selectedProjectName.value && selectedRole.value !== NO_ROLE)
const saving = ref(false)

// Picking a different scope (project <-> instance <-> domain) changes which roles are
// selectable, so a role selected for the previous scope may no longer be valid: reset to no
// role rather than leaving a now-hidden one selected. Grouped by kind so switching between two
// plain projects (same allowed roles) doesn't reset an otherwise still-valid pick.
const scopeKind = computed(() => {
  if (isInstanceScope.value) return 'instance'
  if (isDomainScope.value) return 'domain'
  return 'project'
})
watch(scopeKind, () => {
  selectedRole.value = NO_ROLE
})

function resetAddForm() {
  selectedProject.value = null
  selectedRole.value = NO_ROLE
}

async function refreshUser() {
  const user = await core.api.getUserByUid(props.user.uid)
  permissions.value = user?.permissions ?? []
  emit('user:updated', { uid: props.user.uid })
}

// Only the instance/domain admin grant can be revoked under OAuth (see isAuthWithUsersProvider
// above); a plain project role can always be revoked when auth is form/basic.
function canRevoke(item) {
  return isAuthWithUsersProvider.value || isInstanceOrDomainRole(item.role)
}

// Instance/domain admin aren't a single field that can be swapped in place, they're separate
// grants, so changing between them means grant-then-revoke (grant first, so if it fails the
// user just keeps their old role instead of ending up with neither). A plain project role is
// just re-granted: grantUserRole overwrites the existing role for that user/project.
async function changeRole(item, newRole) {
  if (newRole === item.role) return
  saving.value = true
  try {
    if (isInstanceOrDomainRole(item.role)) {
      const newDomain = newRole === ROLE.DOMAIN_ADMIN ? DEFAULT_DOMAIN : null
      await core.api.grantInstanceRole(props.user.uid, ROLE_LOWERCASE[newRole], newDomain)
      const oldDomain = item.role === ROLE.DOMAIN_ADMIN ? item.domain : null
      await core.api.revokeInstanceRole(props.user.uid, ROLE_LOWERCASE[item.role], oldDomain)
    }
    else {
      await core.api.grantUserRole(props.user.uid, item.project, ROLE_LOWERCASE[newRole])
    }
    toast.success(t('settings.users.rolesModal.grantSuccess'))
    await refreshUser()
  }
  catch {
    toast.error(t('settings.users.rolesModal.grantError'))
  }
  finally {
    saving.value = false
  }
}

async function revokeRole(item) {
  if (!canRevoke(item)) return
  saving.value = true
  try {
    if (isInstanceOrDomainRole(item.role)) {
      const domain = item.role === ROLE.DOMAIN_ADMIN ? item.domain : null
      await core.api.revokeInstanceRole(props.user.uid, ROLE_LOWERCASE[item.role], domain)
    }
    else {
      await core.api.revokeUserRole(props.user.uid, item.project, { ifExists: true })
    }
    toast.success(t('settings.users.rolesModal.revokeSuccess'))
    await refreshUser()
  }
  catch {
    toast.error(t('settings.users.rolesModal.revokeError'))
  }
  finally {
    saving.value = false
  }
}

async function grantRole() {
  if (!canGrant.value) return
  saving.value = true
  try {
    if (isInstanceScope.value || isDomainScope.value) {
      const domain = selectedRole.value === ROLE.DOMAIN_ADMIN ? DEFAULT_DOMAIN : null
      await core.api.grantInstanceRole(props.user.uid, ROLE_LOWERCASE[selectedRole.value], domain)
    }
    else {
      await core.api.grantUserRole(props.user.uid, selectedProjectName.value, ROLE_LOWERCASE[selectedRole.value])
    }
    toast.success(t('settings.users.rolesModal.grantSuccess'))
    resetAddForm()
    await refreshUser()
  }
  catch {
    toast.error(t('settings.users.rolesModal.grantError'))
  }
  finally {
    saving.value = false
  }
}

defineExpose({
  roles,
  search,
  filteredRoles,
  availableProjects,
  projectPickerOptions,
  canGrantInstanceRole,
  canGrantDomainRole,
  canRevoke,
  isInstanceScope,
  isDomainScope,
  hiddenRoles,
  selectedProject,
  selectedRole,
  selectedProjectName,
  canGrant,
  saving,
  revokeRole,
  grantRole,
  changeRole
})
</script>

<template>
  <app-modal
    v-model="modelValue"
    :image="image"
    :image-dark="imageDark"
    :title="t('settings.users.rolesModal.title', { uid: user.uid })"
    :ok-title="t('settings.users.rolesModal.close')"
    ok-only
    ok-variant="outline-secondary"
    size="lg"
  >
    <form-control-search
      v-if="roles.length"
      v-model="search"
      class="mb-3"
      clear-text
      :placeholder="t('settings.users.rolesModal.searchPlaceholder')"
    />

    <page-table class="mb-3">
      <template #thead>
        <page-table-th :label="t('settings.users.rolesModal.scopeColumn')" />
        <page-table-th :label="t('settings.users.create.fields.role.label')" />
        <th />
      </template>

      <page-table-tr style="--bs-table-bg-state: var(--bs-action-bg-subtle)">
        <td>
          <project-dropdown-selector
            v-model="selectedProject"
            class="settings-view-users-roles-modal__scope-select"
            :projects="projectPickerOptions"
            :disabled="!projectPickerOptions.length"
            :placeholder="t('settings.users.rolesModal.selectScope')"
          />
        </td>
        <td>
          <project-users-role-dropdown
            v-model="selectedRole"
            :project="selectedProjectName ?? ''"
            :disabled="!selectedProjectName"
            no-role
            :hidden-roles="hiddenRoles"
          />
        </td>
        <page-table-td-actions>
          <button
            type="button"
            class="btn btn-action"
            :disabled="!canGrant || saving"
            @click.stop="grantRole"
          >
            {{ t('settings.users.rolesModal.add') }}
          </button>
        </page-table-td-actions>
      </page-table-tr>

      <page-table-tr
        v-for="item in filteredRoles"
        :key="`${item.role}-${item.project}`"
      >
        <td>
          <instance-users-role-badge
            :role="item.role"
            :project="item.project === INSTANCE_SCOPE ? null : item.project"
          />
        </td>
        <td>
          <project-users-role-dropdown
            :model-value="item.role"
            :project="item.project"
            :disabled="saving"
            :hidden-roles="hiddenRolesFor(item.project === INSTANCE_SCOPE)"
            @update:model-value="changeRole(item, $event)"
          />
        </td>
        <page-table-td-actions>
          <button-row-action-delete
            :disabled="saving || !canRevoke(item)"
            @click.stop="revokeRole(item)"
          />
        </page-table-td-actions>
      </page-table-tr>

      <page-table-tr v-if="!roles.length">
        <td
          colspan="3"
          class="text-secondary small"
        >
          {{ t('settings.users.rolesModal.empty') }}
        </td>
      </page-table-tr>

      <page-table-tr v-else-if="!filteredRoles.length">
        <td
          colspan="3"
          class="text-secondary small"
        >
          {{ t('settings.users.rolesModal.noResults') }}
        </td>
      </page-table-tr>
    </page-table>
  </app-modal>
</template>

<style scoped lang="scss">
// Matches ProjectUsersRoleDropdown's own fixed content width, so the scope and role pickers in
// the add-row line up instead of the scope one shrinking to fit its shorter placeholder text.
.settings-view-users-roles-modal__scope-select {
  :deep(.btn.dropdown-toggle) {
    width: 10rem;
  }
}
</style>
