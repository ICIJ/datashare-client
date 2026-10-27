import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import CoreSetup from '~tests/unit/CoreSetup'
import Entity from '@/views/Entity/Entity'
import EntityCard from '@/components/Entity/EntityCard/EntityCard'
import EntityCardPlaceholder from '@/components/Entity/EntityCard/EntityCardPlaceholder'
import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'
import EmptyState from '@/components/EmptyState/EmptyState'
import { useEntityStore } from '@/store/modules/entity'

const hit = (id, index = 'banana-papers.entities') => ({
  _id: id,
  _index: index,
  _source: { entityId: id.replace('ftm_', ''), model: 'ftm', entityType: 'Person', properties: {} }
})

const mountView = ({ hits = [], isReady = true, error = null, total = null } = {}) => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()
  const store = useEntityStore()
  store.response = { hits: { hits, total: { value: total ?? hits.length } } }
  store.error = error
  store.isReady = isReady
  return mount(Entity, { global: { plugins: core.plugins } })
}

describe('Entity.vue', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders one card per hit', () => {
    const wrapper = mountView({ hits: [hit('ftm_NK-1'), hit('ftm_NK-2')] })
    expect(wrapper.findAllComponents(EntityCard)).toHaveLength(2)
  })

  it('derives each card project from its own hit index', () => {
    const wrapper = mountView({ hits: [hit('ftm_NK-1', 'flowera.entities')] })
    expect(wrapper.findComponent(EntityCard).props('project')).toBe('flowera')
  })

  // Source documents live in `<project>`, not `<project>.entities`. Handing the card the hit's
  // own _index would point every document link at the entities index.
  it('gives the card the document index, not the entities index', () => {
    const wrapper = mountView({ hits: [hit('ftm_NK-1', 'flowera.entities')] })
    // Asserted on what the card resolves and passes down, not on the prop: EntityCard derives
    // `index` from `project` when none is given.
    expect(wrapper.findComponent(EntityCardProperties).props('index')).toBe('flowera')
  })

  // The ES _id is `<model>_<entityId>`, unique only within one index, so a cross-project list can
  // hold two hits with the same _id. A bare _id key would make one card silently disappear.
  it('keys a card on index and id, so two projects can share an entity id', () => {
    const hits = [hit('ftm_NK-1', 'banana-papers.entities'), hit('ftm_NK-1', 'flowera.entities')]
    expect(mountView({ hits }).findAllComponents(EntityCard)).toHaveLength(2)
  })

  it('skips a hit whose index is not an entities index', () => {
    const wrapper = mountView({ hits: [hit('ftm_NK-1', 'banana-papers')] })
    expect(wrapper.findAllComponents(EntityCard)).toHaveLength(0)
  })

  it('shows placeholders while the store is not ready', () => {
    const wrapper = mountView({ isReady: false })
    expect(wrapper.findComponent(EntityCardPlaceholder).exists()).toBe(true)
    expect(wrapper.findComponent(EmptyState).exists()).toBe(false)
  })

  it('shows the empty state when there are no hits', () => {
    const wrapper = mountView({ hits: [] })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
    expect(wrapper.findAllComponents(EntityCard)).toHaveLength(0)
  })

  it('shows the error state when the store holds an error', () => {
    const wrapper = mountView({ hits: [], error: new Error('boom') })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
  })
})
