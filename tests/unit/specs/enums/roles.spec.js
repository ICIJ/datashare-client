import { compareGrants, parsePermission, ROLE_ICON_DEFAULT, roleColor, roleIcon } from '@/enums/roles.js'

describe('roles', () => {
  describe('parsePermission', () => {
    it('splits a casbin grant into role, domain and project', () => {
      expect(parsePermission({ v1: 'PROJECT_EDITOR', v2: 'default::project-a' }))
        .toEqual({ role: 'PROJECT_EDITOR', domain: 'default', project: 'project-a' })
    })

    it('keeps the wildcards of an instance-wide grant', () => {
      expect(parsePermission({ v1: 'INSTANCE_ADMIN', v2: '*::*' }))
        .toEqual({ role: 'INSTANCE_ADMIN', domain: '*', project: '*' })
    })
  })

  describe('compareGrants', () => {
    it('sorts the highest role first, then A-Z by project', () => {
      const grants = [
        { role: 'PROJECT_MEMBER', domain: 'default', project: 'beta' },
        { role: 'PROJECT_ADMIN', domain: 'default', project: 'zeta' },
        { role: 'PROJECT_MEMBER', domain: 'default', project: 'alpha' },
        { role: 'INSTANCE_ADMIN', domain: '*', project: '*' }
      ]
      expect(grants.sort(compareGrants).map(({ role, project }) => `${role}:${project}`)).toEqual([
        'INSTANCE_ADMIN:*',
        'PROJECT_ADMIN:zeta',
        'PROJECT_MEMBER:alpha',
        'PROJECT_MEMBER:beta'
      ])
    })

    it('orders instance-wide grants of the same rank by domain', () => {
      const grants = [
        { role: 'DOMAIN_ADMIN', domain: 'zulu', project: '*' },
        { role: 'DOMAIN_ADMIN', domain: 'alpha', project: '*' }
      ]
      expect(grants.sort(compareGrants).map(({ domain }) => domain)).toEqual(['alpha', 'zulu'])
    })
  })

  describe('roleIcon and roleColor', () => {
    it('give the icon and color of a known role', () => {
      expect(roleIcon('INSTANCE_ADMIN')).not.toBe(ROLE_ICON_DEFAULT)
      expect(roleColor('INSTANCE_ADMIN')).toBe('var(--bs-danger)')
    })

    it('fall back to the default icon and an inherited color otherwise', () => {
      expect(roleIcon('NOT_A_ROLE')).toBe(ROLE_ICON_DEFAULT)
      expect(roleColor('NOT_A_ROLE')).toBe('inherit')
    })
  })
})
