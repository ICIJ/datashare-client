import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityCard from '@/components/Entity/EntityCard/EntityCard'
import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'

const entity = {
  entityId: 'NK-7f3a',
  model: 'ftm',
  entityType: 'Person',
  documentIds: ['doc-1'],
  properties: { ftm_name: ['Jane Doe'] }
}

const mountCard = (props) => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()
  return mount(EntityCard, {
    global: { plugins: core.plugins },
    props: { entity, properties: ['name', 'sourceDocument'], ...props }
  })
}

describe('EntityCard.vue', () => {
  it('derives the index from a project given as a string', () => {
    const wrapper = mountCard({ project: 'banana-papers' })
    expect(wrapper.findComponent(EntityCardProperties).props('index')).toBe('banana-papers')
  })

  it('derives the index from the name of a project given as an object', () => {
    const wrapper = mountCard({ project: { name: 'banana-papers', label: 'Banana Papers' } })
    expect(wrapper.findComponent(EntityCardProperties).props('index')).toBe('banana-papers')
  })

  it('prefers an explicit index over the project', () => {
    const wrapper = mountCard({ project: 'banana-papers', index: 'other-index' })
    expect(wrapper.findComponent(EntityCardProperties).props('index')).toBe('other-index')
  })

  // A project object carrying no name would otherwise yield an undefined index, which reaches
  // RouterLinkDocument's required `index` prop and resolves to a broken document route.
  it('falls back to an empty index rather than undefined for a nameless project object', () => {
    const wrapper = mountCard({ project: { label: 'Banana Papers' } })
    expect(wrapper.findComponent(EntityCardProperties).props('index')).toBe('')
  })

  it('marks the card selected only in select mode', () => {
    expect(mountCard({ project: 'p', selected: true }).classes()).not.toContain('entity-card--selected')
    expect(mountCard({ project: 'p', selected: true, selectMode: true }).classes()).toContain('entity-card--selected')
  })
})
