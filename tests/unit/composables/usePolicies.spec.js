import { describe, it, expect, vi } from 'vitest'
import { usePolicies } from '@/composables/usePolicies.js'
import * as useConfigModule from '@/composables/useConfig.js'
import { Core } from '@/core/index.js'
import {ROLE} from "@/enums/roles.js";

const mockPolicies = [
  { projectId: 'citrus-confidential', role: 'PROJECT_ADMIN' },
  { projectId: 'banana-papers', role: 'PROJECT_MEMBER'}
]

describe('usePolicies', () => {
  let configGet
  beforeEach(() => {
    configGet = vi.fn((key, fallback) => (key === 'policies' ? mockPolicies : fallback))
    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue({ get: configGet })
  })

  it('getRoleByProject returns roles for known project', () => {
    const { getRoleByProject } = usePolicies()
    expect(getRoleByProject('citrus-confidential')).toEqual('PROJECT_ADMIN')
    expect(getRoleByProject('banana-papers')).toEqual('PROJECT_MEMBER')
  })

  it('getRoleByProject returns default role for unknown project', () => {
    const { getRoleByProject } = usePolicies()
    expect(getRoleByProject('unknown')).toEqual('PROJECT_MEMBER')
  })

  it('formatRole formats single role using translation', () => {
    const core = Core.init().useI18n()
    const { t } = core.i18n.global
    const { formatRole } = usePolicies()
    expect(formatRole(t, 'PROJECT_ADMIN')).toBe('Admin')
    expect(formatRole(t, 'PROJECT_MEMBER')).toBe('Member')
  })

  it('isProjectAdmin returns true for admin project', () => {
    const { isProjectAdmin } = usePolicies()
    expect(isProjectAdmin('citrus-confidential')).toBe(true)
  })

  it('isProjectAdmin returns false for non-admin project', () => {
    const { isProjectAdmin } = usePolicies()
    expect(isProjectAdmin('banana-papers')).toBe(false)
    expect(isProjectAdmin('unknown')).toBe(false)
  })

  it('check role hierarchy with bit to see if a role has at least PROJECT_EDITOR capability', () => {
    const { hasRole } = usePolicies()
    expect(hasRole(ROLE.PROJECT_ADMIN, ROLE.PROJECT_EDITOR)).toBe(true)// true
    expect(hasRole(ROLE.PROJECT_MEMBER, ROLE.PROJECT_EDITOR)).toBe(false) // false
  })

  describe('getHighestRoleFromList', () => {
    it('returns default role for empty list', () => {
      const { getHighestRoleFromList } = usePolicies()
      expect(getHighestRoleFromList([])).toBe(ROLE.PROJECT_MEMBER)
      expect(getHighestRoleFromList(null)).toBe(ROLE.PROJECT_MEMBER)
    })

    it('returns the single role when list has one entry', () => {
      const { getHighestRoleFromList } = usePolicies()
      expect(getHighestRoleFromList([{ role: ROLE.PROJECT_EDITOR }])).toBe(ROLE.PROJECT_EDITOR)
    })

    it('returns the highest role from multiple policies', () => {
      const { getHighestRoleFromList } = usePolicies()
      const list = [{ role: ROLE.PROJECT_MEMBER }, { role: ROLE.PROJECT_ADMIN }]
      expect(getHighestRoleFromList(list)).toBe(ROLE.PROJECT_ADMIN)
    })

    it('returns INSTANCE_ADMIN as highest when present', () => {
      const { getHighestRoleFromList } = usePolicies()
      const list = [
        { role: ROLE.PROJECT_ADMIN },
        { role: ROLE.INSTANCE_ADMIN },
        { role: ROLE.PROJECT_MEMBER }
      ]
      expect(getHighestRoleFromList(list)).toBe(ROLE.INSTANCE_ADMIN)
    })

    it('returns default role when all roles are unknown', () => {
      const { getHighestRoleFromList } = usePolicies()
      expect(getHighestRoleFromList([{ role: 'UNKNOWN_ROLE' }])).toBe(ROLE.PROJECT_MEMBER)
    })
  })

  describe('getHighestRoleFromListForDomain', () => {
    it('returns only roles matching the target domain', () => {
      const { getHighestRoleFromListForDomain } = usePolicies()
      const list = [
        { domainId: 'local', projectId: 'foo', role: ROLE.PROJECT_ADMIN },
        { domainId: 'remote', projectId: 'bar', role: ROLE.INSTANCE_ADMIN }
      ]
      expect(getHighestRoleFromListForDomain(list, 'local')).toBe(ROLE.PROJECT_ADMIN)
    })

    it('includes policies with wildcard domainId', () => {
      const { getHighestRoleFromListForDomain } = usePolicies()
      const list = [
        { domainId: '*', projectId: 'foo', role: ROLE.DOMAIN_ADMIN },
        { domainId: 'local', projectId: 'bar', role: ROLE.PROJECT_MEMBER }
      ]
      expect(getHighestRoleFromListForDomain(list, 'local')).toBe(ROLE.DOMAIN_ADMIN)
    })

    it('returns default role when no policy matches the domain', () => {
      const { getHighestRoleFromListForDomain } = usePolicies()
      const list = [{ domainId: 'remote', projectId: 'foo', role: ROLE.PROJECT_ADMIN }]
      expect(getHighestRoleFromListForDomain(list, 'local')).toBe(ROLE.PROJECT_MEMBER)
    })
  })

  describe('getHighestRoleFromListForProject', () => {
    it('returns the role for the exact domain + project', () => {
      const { getHighestRoleFromListForProject } = usePolicies()
      const list = [
        { domainId: 'local', projectId: 'citrus', role: ROLE.PROJECT_ADMIN },
        { domainId: 'local', projectId: 'banana', role: ROLE.PROJECT_MEMBER }
      ]
      expect(getHighestRoleFromListForProject(list, 'local', 'citrus')).toBe(ROLE.PROJECT_ADMIN)
    })

    it('includes policies with wildcard domainId', () => {
      const { getHighestRoleFromListForProject } = usePolicies()
      const list = [
        { domainId: '*', projectId: 'citrus', role: ROLE.INSTANCE_ADMIN },
        { domainId: 'local', projectId: 'citrus', role: ROLE.PROJECT_MEMBER }
      ]
      expect(getHighestRoleFromListForProject(list, 'local', 'citrus')).toBe(ROLE.INSTANCE_ADMIN)
    })

    it('includes policies with wildcard projectId', () => {
      const { getHighestRoleFromListForProject } = usePolicies()
      const list = [
        { domainId: 'local', projectId: '*', role: ROLE.DOMAIN_ADMIN },
        { domainId: 'local', projectId: 'citrus', role: ROLE.PROJECT_MEMBER }
      ]
      expect(getHighestRoleFromListForProject(list, 'local', 'citrus')).toBe(ROLE.DOMAIN_ADMIN)
    })

    it('excludes policies from a different domain even with wildcard project', () => {
      const { getHighestRoleFromListForProject } = usePolicies()
      const list = [{ domainId: 'remote', projectId: '*', role: ROLE.INSTANCE_ADMIN }]
      expect(getHighestRoleFromListForProject(list, 'local', 'citrus')).toBe(ROLE.PROJECT_MEMBER)
    })

    it('returns default role when no policy matches', () => {
      const { getHighestRoleFromListForProject } = usePolicies()
      const list = [{ domainId: 'local', projectId: 'other', role: ROLE.PROJECT_ADMIN }]
      expect(getHighestRoleFromListForProject(list, 'local', 'citrus')).toBe(ROLE.PROJECT_MEMBER)
    })
  })
})
