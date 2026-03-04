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
