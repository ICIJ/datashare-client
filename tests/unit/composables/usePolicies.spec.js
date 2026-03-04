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

  it('getRolesByProject returns roles for known project', () => {
    const { getRoleByProject } = usePolicies()
    expect(getRoleByProject('citrus-confidential')).toEqual('PROJECT_ADMIN')
    expect(getRoleByProject('banana-papers')).toEqual('PROJECT_MEMBER')
  })

  it('getRolesByProject returns default role for unknown project', () => {
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
})
