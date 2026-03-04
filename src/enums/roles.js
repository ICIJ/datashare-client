export const ROLE = Object.freeze({
  INSTANCE_ADMIN : "INSTANCE_ADMIN",
  DOMAIN_ADMIN : "DOMAIN_ADMIN",
  PROJECT_ADMIN : "PROJECT_ADMIN",
  PROJECT_EDITOR : "PROJECT_EDITOR",
  PROJECT_MEMBER : "PROJECT_MEMBER",
  PROJECT_VISITOR : "PROJECT_VISITOR"
})


export const DEFAULT_ROLE = ROLE.PROJECT_MEMBER

export const ROLE_KEY = Object.freeze({
  PROJECT_ADMIN: 'roles.project_admin',
  PROJECT_EDITOR: 'roles.project_editor',
  PROJECT_MEMBER: 'roles.project_member'
})


// Each role is a single bit flag (position in hierarchy)
export const ROLE_BIT = Object.freeze({
  PROJECT_VISITOR: 1 << 0,  // 0b000001 = 1
  PROJECT_MEMBER:  1 << 1,  // 0b000010 = 2
  PROJECT_EDITOR:  1 << 2,  // 0b000100 = 4
  PROJECT_ADMIN:   1 << 3,  // 0b001000 = 8
  DOMAIN_ADMIN:    1 << 4,  // 0b010000 = 16
  INSTANCE_ADMIN:  1 << 5,  // 0b100000 = 32
})

// Cumulative: each role includes all roles below it
export const ROLE_HIERARCHY = Object.freeze({
  PROJECT_VISITOR: 0b000001,  // 1  — visitor only
  PROJECT_MEMBER:  0b000011,  // 3  — member + visitor
  PROJECT_EDITOR:  0b000111,  // 7  — editor + member + visitor
  PROJECT_ADMIN:   0b001111,  // 15 — + editor + member + visitor
  DOMAIN_ADMIN:    0b011111,  // 31 — + project_admin + ...
  INSTANCE_ADMIN:  0b111111,  // 63 — all roles
})

