import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import Entity from '@/views/Entity/Entity'
import EntityCard from '@/components/Entity/EntityCard/EntityCard'
import EntityCardPlaceholder from '@/components/Entity/EntityCard/EntityCardPlaceholder'
import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'
import EmptyState from '@/components/EmptyState/EmptyState'
import { elasticsearch } from '@/api/elasticsearch'
import { useEntityStore } from '@/store/modules/entity'

const hit = (id, index = 'banana-papers.entities') => ({
  _id: id,
  _index: index,
  _source: { entityId: id.replace('ftm_', ''), model: 'ftm', entityType: 'Person', properties: {} }
})

const response = (hits = [], total = hits.length) => ({ hits: { hits, total: { value: total } } })

/**
 * Mounts the view the way the router does: with projects configured and the API stubbed, then
 * waits for the mount-time refresh. Asserting before that settles would describe a DOM the store
 * has already moved past.
 */
const mountView = async ({ hits = [], total = null, reject = null, query = {} } = {}) => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()
  core.config.set('projects', [{ name: 'banana-papers' }, { name: 'flowera' }])
  const search = vi.spyOn(elasticsearch, 'searchEntities')
  if (reject) {
    search.mockRejectedValue(reject)
  }
  else {
    search.mockResolvedValue(response(hits, total ?? hits.length))
  }
  await core.router.push({ name: 'entity.list', query })
  const wrapper = mount(Entity, { global: { plugins: core.plugins } })
  await flushPromises()
  return { wrapper, search, core, store: useEntityStore() }
}

describe('Entity.vue', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => vi.restoreAllMocks())

  it('searches on mount, across every project the user can see', async () => {
    const { search, store } = await mountView()
    expect(search).toHaveBeenCalledTimes(1)
    expect(store.projects).toEqual(['banana-papers', 'flowera'])
  })

  it('renders one card per hit', async () => {
    const { wrapper } = await mountView({ hits: [hit('ftm_NK-1'), hit('ftm_NK-2')] })
    expect(wrapper.findAllComponents(EntityCard)).toHaveLength(2)
  })

  it('derives each card project from its own hit index', async () => {
    const { wrapper } = await mountView({ hits: [hit('ftm_NK-1', 'flowera.entities')] })
    expect(wrapper.findComponent(EntityCard).props('project')).toBe('flowera')
  })

  // Source documents live in `<project>`, not `<project>.entities`.
  it('gives the card the document index, not the entities index', async () => {
    const { wrapper } = await mountView({ hits: [hit('ftm_NK-1', 'flowera.entities')] })
    expect(wrapper.findComponent(EntityCardProperties).props('index')).toBe('flowera')
  })

  // The ES _id is `<model>_<entityId>`, unique only within one index.
  it('keys a card on index and id, so two projects can share an entity id', async () => {
    const hits = [hit('ftm_NK-1', 'banana-papers.entities'), hit('ftm_NK-1', 'flowera.entities')]
    const { wrapper } = await mountView({ hits })
    expect(wrapper.findAllComponents(EntityCard)).toHaveLength(2)
  })

  it('skips a hit whose index is not an entities index', async () => {
    const { wrapper } = await mountView({ hits: [hit('ftm_NK-1', 'banana-papers')] })
    expect(wrapper.findAllComponents(EntityCard)).toHaveLength(0)
  })

  it('shows placeholders while the store is not ready', async () => {
    const { wrapper, store } = await mountView({ hits: [hit('ftm_NK-1')] })
    store.isReady = false
    await flushPromises()
    expect(wrapper.findComponent(EntityCardPlaceholder).exists()).toBe(true)
  })

  it('shows the empty state when there are no hits', async () => {
    const { wrapper } = await mountView({ hits: [] })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
    expect(wrapper.findAllComponents(EntityCard)).toHaveLength(0)
  })

  it('shows the error state when the store holds an error', async () => {
    const { wrapper } = await mountView({ reject: new Error('boom') })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
  })

  // The spec's error handling says the message is surfaced, not just an illustration: a user who
  // hits a cluster error otherwise has nothing to report.
  it('surfaces the error message rather than only a generic label', async () => {
    const { wrapper } = await mountView({ reject: new Error('index_not_found_exception') })
    expect(wrapper.text()).toContain('index_not_found_exception')
  })

  // Review focus 5, at the level a user meets it: a deep link, not a store mutation.
  it('reads the page from the URL, so a shared link opens the page it names', async () => {
    const { search } = await mountView({ hits: [], total: 300, query: { page: '3', perPage: '10' } })
    expect(search.mock.calls.at(-1)[0].from).toBe(20)
    expect(search.mock.calls.at(-1)[0].perPage).toBe(10)
  })

  it('reads the sort from the URL without depending on the settings panel being mounted', async () => {
    const { search } = await mountView({ query: { sort: 'entityId', order: 'asc' } })
    expect(search.mock.calls.at(-1)[0].sort).toEqual({ entityId: 'asc' })
  })

  it('does not search again when an unrelated query parameter changes', async () => {
    const { search, core } = await mountView()
    expect(search).toHaveBeenCalledTimes(1)
    await core.router.push({ name: 'entity.list', query: { modal: 'true' } })
    await flushPromises()
    expect(search).toHaveBeenCalledTimes(1)
  })
})
