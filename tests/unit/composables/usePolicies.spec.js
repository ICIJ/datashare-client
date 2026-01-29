import { describe, it, expect, vi } from 'vitest'
import { usePolicies } from '@/composables/usePolicies.js'
import * as useConfigModule from '@/composables/useConfig.js'
import { Core } from '@/core/index.js'

const mockPolicies = [
  { projectId: 'citrus-confidential', roles: ['ADMIN', 'READER'], admin: true },
  { projectId: 'banana-papers', roles: ['READER'], admin: false }
]

describe('usePolicies', () => {
  let configGet
  beforeEach(() => {
    configGet = vi.fn((key, fallback) => (key === 'policies' ? mockPolicies : fallback))
    vi.spyOn(useConfigModule, 'useConfig').mockReturnValue({ get: configGet })
  })

  it('getRolesByProject returns roles for known project', () => {
    const { getRolesByProject } = usePolicies()
    expect(getRolesByProject('citrus-confidential')).toEqual(['ADMIN', 'READER'])
    expect(getRolesByProject('banana-papers')).toEqual(['READER'])
  })

  it('getRolesByProject returns default role for unknown project', () => {
    const { getRolesByProject } = usePolicies()
    expect(getRolesByProject('unknown')).toEqual(['READER'])
  })

  it('formatRole formats single role using translation', () => {
    const core = Core.init().useI18n()
    const { t } = core.i18n.global
    const { formatRole } = usePolicies()
    expect(formatRole(t, 'ADMIN')).toBe('Admin')
    expect(formatRole(t, 'READER')).toBe('Member')
  })

  it('formatRoles formats multiple roles array', () => {
    const { formatRoles } = usePolicies()
    const core = Core.init().useI18n()
    const { t } = core.i18n.global
    expect(formatRoles(t, ['ADMIN', 'READER'])).toBe('Admin, Member')
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
})
