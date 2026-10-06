<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import image from '@/assets/images/illustrations/app-modal-default-light.svg'
import imageDark from '@/assets/images/illustrations/app-modal-default-dark.svg'
import AppModal from '@/components/AppModal/AppModal.vue'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import DisplayUser from '@/components/Display/DisplayUser.vue'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch.vue'
import InstanceUsersRoleBadge from '@/components/InstanceUsers/InstanceUsersRoleBadge.vue'
import PageTableGeneric from '@/components/PageTable/PageTableGeneric.vue'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions.vue'
import PageTableTr from '@/components/PageTable/PageTableTr.vue'
import ProjectButton from '@/components/Project/ProjectButton.vue'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector.vue'
import ProjectUsersRoleDropdown from '@/components/ProjectUsers/ProjectUsersRoleDropdown.vue'
import SettingsViewUsersNotFound from '@/views/Settings/SettingsView/SettingsViewUsersNotFound.vue'
import SettingsViewUsersRolesCascadeModal from '@/views/Settings/SettingsView/SettingsViewUsersRolesCascadeModal.vue'

import { useAuth } from '@/composables/useAuth.js'
import { usePolicies } from '@/composables/usePolicies.js'
import { useCore } from '@/composables/useCore.js'
import { useToast } from '@/composables/useToast.js'
import { displayLabelOf, projectDisplayLabel } from '@/utils/projects'
import { compareGrants, DEFAULT_DOMAIN, isInstanceOrDomainRole, NO_ROLE, parsePermission, ROLE, ROLE_LOWERCASE } from '@/enums/roles.js'

// The wildcard project casbin uses to represent the instance-wide scope in this UI. Granting there
// goes through the dedicated PUT/DELETE /api/users/admin/:uid/role endpoint (grantInstanceRole/
// revokeInstanceRole), not the project-scoped /index/:index one.
const INSTANCE_SCOPE = '*'
// A synthetic scope-picker-only value: existing domain-admin grants still parse to project '*'
// (same as instance-admin, see `roles` below), but the add-row scope picker needs its own
// distinct entry so a viewer can grant a domain-admin role without going through "Instance".
// Never sent to the API directly, only used to pick which role grantRole sends and how toastMessage words it.
const DOMAIN_SCOPE = '**'
const PROJECT_ROLES = [ROLE.PROJECT_VISITOR, ROLE.PROJECT_MEMBER, ROLE.PROJECT_EDITOR, ROLE.PROJECT_ADMIN]
const INSTANCE_ROLES = [ROLE.DOMAIN_ADMIN, ROLE.INSTANCE_ADMIN]

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  // Set when the modal was opened from a URL naming a user that doesn't exist.
  notFound: {
    type: Boolean
  }
})

const modelValue = defineModel({ type: Boolean })
const emit = defineEmits(['user:updated'])

const core = useCore()
const { toast } = useToast()
const { t } = useI18n()
const { isInstanceAdmin, formatRole } = usePolicies()
// Under OAuth, project membership comes from the identity provider's groups and is reconciled at
// each login: a project role revoked here comes back, and one granted on a project the provider
// does not list goes away. The role level on a project it does list is kept, so it can still be
// changed here. Only the datashare-native instance/domain admin grants are fully managed here.
const { isCurrentUser, isAuthWithUsersProvider } = useAuth()

const isSelf = computed(() => isCurrentUser(props.user.uid))

const permissions = computed(() => props.user?.permissions ?? [])
const search = ref('')

// Clear the search box and the add row whenever the modal is reused for a different user.
watch(() => props.user?.uid, () => {
  search.value = ''
  resetAddForm()
})

// Each permission is { v1: role, v2: 'domain::project' }, parsed into { role, domain, project }: the
// domain is sent when revoking a domain admin grant and orders the rows. Sorted by role rank, then
// A-Z (see compareGrants).
const roles = computed(() => permissions.value.map(parsePermission).sort(compareGrants))

const filteredRoles = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return roles.value
  return roles.value.filter(({ project, role }) => {
    const labels = project === INSTANCE_SCOPE ? [scopeEntry({ role }).label] : [projectDisplayLabel(project, core), project]
    return labels.some(label => label.toLowerCase().includes(query))
  })
})

const fields = computed(() => [
  { key: 'scope', text: t('settings.users.rolesModal.scopeColumn') },
  { key: 'role', text: t('settings.users.rolesModal.roleColumn') }
])

const emptyLabel = computed(() =>
  roles.value.length
    ? t('settings.users.rolesModal.noResults')
    : t('settings.users.rolesModal.empty')
)

const assignedProjects = computed(() => new Set(roles.value.map(({ project }) => project)))

// An instance or domain admin grant already covers every project: offering a project-specific
// grant on top would be dead data (and reappear as a surprise if the wide role is later
// revoked), so no project entry is offered while the user holds either.
const targetHasWideRole = computed(() => roles.value.some(({ role }) => isInstanceOrDomainRole(role)))

const availableProjects = computed(() => {
  if (targetHasWideRole.value) return []
  return core.projects
    .filter(({ name }) => !assignedProjects.value.has(name))
    .sort((a, b) => displayLabelOf(a).localeCompare(displayLabelOf(b)))
})

const canGrantInstanceRole = computed(() => isInstanceAdmin.value && !roles.value.some(({ role }) => role === ROLE.INSTANCE_ADMIN))
// Domain admin is strictly weaker than instance admin, so it's not offered on top of it either.
const canGrantDomainRole = computed(() => isInstanceAdmin.value && !roles.value.some(({ role }) => role === ROLE.DOMAIN_ADMIN || role === ROLE.INSTANCE_ADMIN))

const instanceScopeEntry = computed(() => ({ name: INSTANCE_SCOPE, label: t('settings.users.rolesModal.scope.instance') }))
const domainScopeEntry = computed(() => ({ name: DOMAIN_SCOPE, label: t('settings.users.rolesModal.scope.domain') }))
const projectPickerOptions = computed(() => [
  ...(canGrantInstanceRole.value ? [instanceScopeEntry.value] : []),
  ...(canGrantDomainRole.value ? [domainScopeEntry.value] : []),
  // Under OAuth a new project grant would be revoked at the next login
  ...(isAuthWithUsersProvider.value ? availableProjects.value : [])
])

// True when this viewer can never offer any scope here, independently of what the target
// holds: not instance admin (so no instance/domain entry) and under OAuth (so no project entry
// either, since a project grant there wouldn't stick past the next login). Checked first since
// it explains an empty picker even for a target with no grants at all, which the other reasons
// below wrongly attribute to the target.
const viewerCanOfferNoScope = computed(() => !isInstanceAdmin.value && !isAuthWithUsersProvider.value)

// Explains the disabled scope picker: the viewer themselves can't offer any scope here, this
// user already holds a role covering every project, or every project already has a grant and
// this viewer cannot offer instance/domain scope. Not shown while merely mid-save, since that
// disablement is unrelated and temporary.
const scopePickerDisabledTitle = computed(() => {
  if (saving.value || projectPickerOptions.value.length) return null
  if (viewerCanOfferNoScope.value) return t('settings.users.rolesModal.scopePickerDisabledNoViewerScope')
  return targetHasWideRole.value
    ? t('settings.users.rolesModal.scopePickerDisabledWideRole')
    : t('settings.users.rolesModal.scopePickerDisabledNoOptions')
})

function scopeEntry({ role }) {
  return role === ROLE.DOMAIN_ADMIN ? domainScopeEntry.value : instanceScopeEntry.value
}

const selectedProject = ref(null)
// The scope picker's menu is teleported into this modal rather than <body>, where it would open
// under the modal; the same target ProjectUsersRoleDropdown uses for the role pickers.
const scopeCell = ref(null)
const scopePickerTeleportTo = computed(() => scopeCell.value?.closest('.modal') ?? 'body')
// Default to no role to force an explicit pick
const selectedRole = ref(NO_ROLE)
const selectedProjectName = computed(() => selectedProject.value?.name ?? null)
const isInstanceScope = computed(() => selectedProjectName.value === INSTANCE_SCOPE)
const isDomainScope = computed(() => selectedProjectName.value === DOMAIN_SCOPE)
// Each scope kind offers its own roles: project roles for a project, only instance admin for
// "Instance", only domain admin for "Domain".
const hiddenRoles = computed(() => {
  if (isInstanceScope.value) return [...PROJECT_ROLES, ROLE.DOMAIN_ADMIN]
  if (isDomainScope.value) return [...PROJECT_ROLES, ROLE.INSTANCE_ADMIN]
  return INSTANCE_ROLES
})

// A grant needs an actual role picked; NO_ROLE is the unselected/default state.
const canGrant = computed(() => !!selectedProjectName.value && selectedRole.value !== NO_ROLE)
const saving = ref(false)

// Grouped by kind so switching between two plain projects (same allowed roles) doesn't reset an otherwise still-valid pick.
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

// An instance admin grant can be revoked by an instance admin only, mirroring who can
// grant it.
function canRevoke(item) {
  if (isSelf.value && item.role === ROLE.INSTANCE_ADMIN) return false
  return isInstanceOrDomainRole(item.role) ? isInstanceAdmin.value : isAuthWithUsersProvider.value
}

function toastMessage(key, role, project) {
  const isProjectScope = project !== INSTANCE_SCOPE && project !== DOMAIN_SCOPE
  const params = { role: formatRole(t, role), project: isProjectScope ? projectDisplayLabel(project, core) : project, uid: props.user.uid }
  return t(`settings.users.rolesModal.${key}${isProjectScope ? 'OnProject' : ''}`, params)
}

function revokeGrant(item) {
  if (isInstanceOrDomainRole(item.role)) {
    const domain = item.role === ROLE.DOMAIN_ADMIN ? item.domain : null
    return core.api.revokeInstanceRole(props.user.uid, ROLE_LOWERCASE[item.role], domain)
  }
  return core.api.revokeUserRole(props.user.uid, item.project, { ifExists: true })
}

// Only project rows have a role picker (instance/domain rows show a fixed badge: they're
// separate grants, revoke and grant again to switch). grantUserRole overwrites the existing
// role for that user/project.
async function changeRole(item, newRole) {
  if (newRole === item.role) return
  saving.value = true
  try {
    await core.api.grantUserRole(props.user.uid, item.project, ROLE_LOWERCASE[newRole])
    toast.success(toastMessage('grantSuccess', newRole, item.project))
    emit('user:updated', { uid: props.user.uid })
  }
  catch {
    toast.error(toastMessage('grantError', newRole, item.project))
  }
  finally {
    saving.value = false
  }
}

async function revokeRole(item) {
  if (!canRevoke(item)) return
  saving.value = true
  try {
    await revokeGrant(item)
    toast.success(toastMessage('revokeSuccess', item.role, item.project))
    emit('user:updated', { uid: props.user.uid })
  }
  catch {
    toast.error(toastMessage('revokeError', item.role, item.project))
  }
  finally {
    saving.value = false
  }
}

// An instance or domain admin role gives access to every project of its scope: any grant the
// user already holds becomes redundant, so granting one of these roles revokes every other grant
// after a confirmation step (see SettingsViewUsersRolesCascadeModal).
// TODO #DOMAIN: once multiple domains exist, a domain-admin grant should only cascade-revoke
// grants within that domain, not every grant regardless of domain; harmless today since only one
// domain exists.
const showCascadeModal = ref(false)
const cascadeGrants = ref([])

async function grantRole() {
  if (!canGrant.value) return
  if ((isInstanceScope.value || isDomainScope.value) && roles.value.length) {
    cascadeGrants.value = roles.value
    showCascadeModal.value = true
    return
  }
  await performGrant()
}

function onCascadeConfirm() {
  return performGrant()
}

async function performGrant() {
  saving.value = true
  try {
    if (isInstanceScope.value || isDomainScope.value) {
      // The domain only matters for DOMAIN_ADMIN; the backend ignores it for INSTANCE_ADMIN.
      const domain = selectedRole.value === ROLE.DOMAIN_ADMIN ? DEFAULT_DOMAIN : null
      await core.api.grantInstanceRole(props.user.uid, ROLE_LOWERCASE[selectedRole.value], domain)
      // The cascade-revoke below is this component's own invariant, not enforced by the
      // grantInstanceRole endpoint itself: any other caller (a script, another admin screen)
      // granting a wide role would leave stale project grants behind. Moving this server-side
      // would need backend work beyond this component.
      if (cascadeGrants.value.length) {
        const results = await Promise.allSettled(cascadeGrants.value.map(revokeGrant))
        if (results.some(result => result.status === 'rejected')) {
          toast.error(t('settings.users.rolesModal.cascadeModal.cleanupError'))
        }
      }
    }
    else {
      await core.api.grantUserRole(props.user.uid, selectedProjectName.value, ROLE_LOWERCASE[selectedRole.value])
    }
    toast.success(toastMessage('grantSuccess', selectedRole.value, selectedProjectName.value))
    resetAddForm()
    emit('user:updated', { uid: props.user.uid })
  }
  catch {
    toast.error(toastMessage('grantError', selectedRole.value, selectedProjectName.value))
  }
  finally {
    saving.value = false
    cascadeGrants.value = []
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
  scopePickerDisabledTitle,
  viewerCanOfferNoScope,
  canRevoke,
  isInstanceScope,
  isDomainScope,
  hiddenRoles,
  selectedProject,
  selectedRole,
  selectedProjectName,
  canGrant,
  showCascadeModal,
  cascadeGrants,
  onCascadeConfirm,
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
    <!-- The plain `title` above still feeds b-modal's own attribute; this renders the uid through
         DisplayUser (avatar + whatever the user-display-username pipeline resolves it to). -->
    <template #title>
      <i18n-t
        keypath="settings.users.rolesModal.title"
        tag="span"
        class="d-inline-flex align-items-center gap-1"
      >
        <template #uid>
          <display-user
            v-if="user.uid"
            :value="user.uid"
          />
        </template>
      </i18n-t>
    </template>

    <settings-view-users-not-found
      v-if="notFound"
      :uid="user.uid"
    />
    <div
      v-else-if="roles.length"
      class="d-flex justify-content-end mb-3"
    >
      <form-control-search
        v-model="search"
        clear-text
        :placeholder="t('settings.users.rolesModal.searchPlaceholder')"
      />
    </div>

    <page-table-generic
      v-if="!notFound"
      class="mb-3"
      :items="filteredRoles"
      :fields="fields"
    >
      <template #top-row>
        <page-table-tr style="--bs-table-bg-state: var(--bs-action-bg-subtle)">
          <td ref="scopeCell">
            <!-- A disabled native control never fires mouse events, so a tooltip targeting it
                 directly never shows; wrapping it in a span with a native `title` sidesteps that
                 (see SearchBreadcrumbFormFooter.vue for the same pattern). The title is also set
                 on the control itself for keyboard/screen-reader focus, which never reaches the
                 wrapper. -->
            <span
              class="d-inline-block"
              :title="scopePickerDisabledTitle"
            >
              <project-dropdown-selector
                v-model="selectedProject"
                class="settings-view-users-roles-modal__scope-select"
                :teleport-to="scopePickerTeleportTo"
                :projects="projectPickerOptions"
                :disabled="saving || !projectPickerOptions.length"
                :title="scopePickerDisabledTitle"
                :placeholder="t('settings.users.rolesModal.selectScope')"
              />
            </span>
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
            <b-button
              variant="action"
              size="md"
              :disabled="!canGrant || saving"
              @click.stop="grantRole"
            >
              {{ t('settings.users.rolesModal.grant') }}
            </b-button>
          </page-table-td-actions>
        </page-table-tr>
      </template>

      <template #empty>
        {{ emptyLabel }}
      </template>

      <template #cell(scope)="{ item }">
        <project-button
          v-if="item.project === INSTANCE_SCOPE"
          :project="scopeEntry(item)"
          no-caption
          no-link
        />
        <instance-users-role-badge
          v-else
          :role="item.role"
          :project="item.project"
        />
      </template>

      <template #cell(role)="{ item }">
        <instance-users-role-badge
          v-if="item.project === INSTANCE_SCOPE"
          :role="item.role"
        />
        <project-users-role-dropdown
          v-else
          :model-value="item.role"
          :project="item.project"
          :disabled="saving"
          :hidden-roles="INSTANCE_ROLES"
          @update:model-value="changeRole(item, $event)"
        />
      </template>

      <template #row-actions="{ item }">
        <button-row-action-delete
          :disabled="saving || !canRevoke(item)"
          @click.stop="revokeRole(item)"
        />
      </template>
    </page-table-generic>
  </app-modal>

  <settings-view-users-roles-cascade-modal
    v-model="showCascadeModal"
    :grants="cascadeGrants"
    @confirm="onCascadeConfirm"
  />
</template>

<style scoped lang="scss">
// DropdownSelector's wrapper is a block with an input background: in a table cell it would paint
// that background across the whole cell, wider than the button.
.settings-view-users-roles-modal__scope-select {
  width: fit-content;
}
</style>
