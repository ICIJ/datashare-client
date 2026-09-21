import IPhUserSquare from '~icons/ph/user-square'
import IPhPersonSimpleBike from '~icons/ph/person-simple-bike'
import IPhPersonSimpleRun from '~icons/ph/person-simple-run'
import IPhPersonSimpleWalk from '~icons/ph/person-simple-walk'
import IPhPersonSimpleHike from '~icons/ph/person-simple-hike'
import IPhPersonSimpleSwim from '~icons/ph/person-simple-swim'
import IPhPersonSimpleTaiChi from '~icons/ph/person-simple-tai-chi'
import { markRaw } from 'vue'

export const ROLE = Object.freeze({
  INSTANCE_ADMIN: 'INSTANCE_ADMIN',
  DOMAIN_ADMIN: 'DOMAIN_ADMIN',
  PROJECT_ADMIN: 'PROJECT_ADMIN',
  PROJECT_EDITOR: 'PROJECT_EDITOR',
  PROJECT_MEMBER: 'PROJECT_MEMBER',
  PROJECT_VISITOR: 'PROJECT_VISITOR'
})

export const ROLE_LOWERCASE = Object.freeze({
  INSTANCE_ADMIN: 'instance_admin',
  DOMAIN_ADMIN: 'domain_admin',
  PROJECT_ADMIN: 'admin',
  PROJECT_EDITOR: 'editor',
  PROJECT_MEMBER: 'member',
  PROJECT_VISITOR: 'visitor'
})

export const DEFAULT_ROLE = ROLE.PROJECT_MEMBER

export const NO_ROLE = 'NO_ROLE'

export const ROLE_KEY = Object.freeze({
  INSTANCE_ADMIN: 'role.instance_admin',
  DOMAIN_ADMIN: 'role.domain_admin',
  PROJECT_ADMIN: 'role.project_admin',
  PROJECT_EDITOR: 'role.project_editor',
  PROJECT_MEMBER: 'role.project_member',
  PROJECT_VISITOR: 'role.project_visitor',
  NO_ROLE: 'role.no_role'
})

// Each role is a single bit flag (position in hierarchy)
export const ROLE_BIT = Object.freeze({
  PROJECT_VISITOR: 1 << 0, // 0b000001 = 1
  PROJECT_MEMBER: 1 << 1, // 0b000010 = 2
  PROJECT_EDITOR: 1 << 2, // 0b000100 = 4
  PROJECT_ADMIN: 1 << 3, // 0b001000 = 8
  DOMAIN_ADMIN: 1 << 4, // 0b010000 = 16
  INSTANCE_ADMIN: 1 << 5, // 0b100000 = 32
})

// Cumulative: each role includes all roles below it
export const ROLE_HIERARCHY = Object.freeze({
  PROJECT_VISITOR: 0b000001, // 1 - visitor only
  PROJECT_MEMBER: 0b000011, // 3 - member + visitor
  PROJECT_EDITOR: 0b000111, // 7 - editor + member + visitor
  PROJECT_ADMIN: 0b001111, // 15 - + editor + member + visitor
  DOMAIN_ADMIN: 0b011111, // 31 - + project_admin + ...
  INSTANCE_ADMIN: 0b111111, // 63 - all roles
})

// Instance/domain admin are instance-wide grants (project: '*'), not scoped to a single project.
export function isInstanceOrDomainRole(role) {
  return role === ROLE.DOMAIN_ADMIN || role === ROLE.INSTANCE_ADMIN
}

export const ROLE_ICON_DEFAULT = markRaw(IPhUserSquare)

// Per-role icon/color, shared by DisplayRole and anything else that needs to badge a role
// (e.g. ProjectRoleThumbnail overlays ROLE_ICON on a project thumbnail).
export const ROLE_ICON = Object.freeze({
  [ROLE.INSTANCE_ADMIN]: markRaw(IPhPersonSimpleBike),
  [ROLE.DOMAIN_ADMIN]: markRaw(IPhPersonSimpleRun),
  [ROLE.PROJECT_ADMIN]: markRaw(IPhPersonSimpleWalk),
  [ROLE.PROJECT_EDITOR]: markRaw(IPhPersonSimpleHike),
  [ROLE.PROJECT_MEMBER]: markRaw(IPhPersonSimpleSwim),
  [ROLE.PROJECT_VISITOR]: markRaw(IPhPersonSimpleTaiChi),
  [NO_ROLE]: ROLE_ICON_DEFAULT
})

export const ROLE_COLOR = Object.freeze({
  [ROLE.INSTANCE_ADMIN]: 'var(--bs-danger)',
  [ROLE.DOMAIN_ADMIN]: 'var(--bs-success)',
  [ROLE.PROJECT_ADMIN]: 'var(--bs-category-person)',
  [ROLE.PROJECT_EDITOR]: 'var(--bs-warning)',
  [ROLE.PROJECT_MEMBER]: 'var(--bs-info)',
  [ROLE.PROJECT_VISITOR]: 'var(--bs-secondary)'
})
