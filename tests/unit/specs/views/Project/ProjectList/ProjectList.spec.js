import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectList from '@/views/Project/ProjectList/ProjectList'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      elasticsearch: {
        countByProject: vi.fn(),
        maxExtractionDateByProject: vi.fn()
      }
    }
  }
})

describe('ProjectList.vue', () => {
  let core

  const projects = [
    { name: 'foo', label: 'Foo', description: 'animals' },
    { name: 'bar', label: 'Bar', description: 'plants' },
    { name: 'baz', label: 'Baz', description: 'minerals' }
  ]

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
  })

  beforeEach(async () => {
    core.createPinia()
    await core.router.replace('/')
    core.config.set('projects', projects)

    api.elasticsearch.countByProject.mockResolvedValue({ aggregations: { index: { buckets: [] } } })
    api.elasticsearch.maxExtractionDateByProject.mockResolvedValue({ aggregations: { index: { buckets: [] } } })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('shows all projects when there is no search query', async () => {
    const wrapper = shallowMount(ProjectList, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    const entries = wrapper.findComponent({ name: 'ProjectEntries' })
    expect(entries.props('projects')).toHaveLength(3)
  })

  it('filters projects by name', async () => {
    const wrapper = shallowMount(ProjectList, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    await core.router.push({ query: { q: 'foo' } })
    await flushPromises()
    const entries = wrapper.findComponent({ name: 'ProjectEntries' })
    expect(entries.props('projects')).toHaveLength(1)
    expect(entries.props('projects')[0].name).toBe('foo')
  })

  it('filters projects by label', async () => {
    const wrapper = shallowMount(ProjectList, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    await core.router.push({ query: { q: 'Bar' } })
    await flushPromises()
    const entries = wrapper.findComponent({ name: 'ProjectEntries' })
    expect(entries.props('projects')).toHaveLength(1)
    expect(entries.props('projects')[0].name).toBe('bar')
  })

  it('filters projects by description', async () => {
    const wrapper = shallowMount(ProjectList, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    await core.router.push({ query: { q: 'minerals' } })
    await flushPromises()
    const entries = wrapper.findComponent({ name: 'ProjectEntries' })
    expect(entries.props('projects')).toHaveLength(1)
    expect(entries.props('projects')[0].name).toBe('baz')
  })

  it('returns no projects when search query matches nothing', async () => {
    const wrapper = shallowMount(ProjectList, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
    await flushPromises()
    await core.router.push({ query: { q: 'nomatch' } })
    await flushPromises()
    const entries = wrapper.findComponent({ name: 'ProjectEntries' })
    expect(entries.props('projects')).toHaveLength(0)
  })
})
