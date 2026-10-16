import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'
import EntityCardPropertiesEntry from '@/components/Entity/EntityCard/EntityCardPropertiesEntry'
import EntityCardPropertiesEntryName from '@/components/Entity/EntityCard/EntityCardPropertiesEntryName'
import EntityCardPropertiesEntrySourceDocument from '@/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument'
import EntityCardPropertiesEntryProject from '@/components/Entity/EntityCard/EntityCardPropertiesEntryProject'

const entity = {
  entityId: 'NK-7f3a',
  model: 'ftm',
  entityType: 'Person',
  documentIds: ['doc-1'],
  properties: { ftm_name: ['Jane Doe'], ftm_country: ['tm'] }
}

const mountProperties = (properties) => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()
  return mount(EntityCardProperties, {
    global: { plugins: core.plugins },
    props: { entity, properties, project: 'banana-papers', index: 'banana-papers' }
  })
}

describe('EntityCardProperties.vue', () => {
  it('routes a known key to its own entry component', () => {
    const wrapper = mountProperties(['name', 'sourceDocument', 'project'])
    expect(wrapper.findComponent(EntityCardPropertiesEntryName).exists()).toBe(true)
    expect(wrapper.findComponent(EntityCardPropertiesEntrySourceDocument).exists()).toBe(true)
    expect(wrapper.findComponent(EntityCardPropertiesEntryProject).exists()).toBe(true)
  })

  it('falls back to the generic entry for an unmapped model property', () => {
    const wrapper = mountProperties(['ftm_country'])
    expect(wrapper.findComponent(EntityCardPropertiesEntryName).exists()).toBe(false)
    // Exactly one: the specific entries each wrap the generic one, so a count greater than zero
    // would also hold if the key had routed to a specific entry.
    expect(wrapper.findAllComponents(EntityCardPropertiesEntry)).toHaveLength(1)
    expect(wrapper.text()).toContain('tm')
  })

  it('renders a row per requested property, in the requested order', () => {
    const wrapper = mountProperties(['name', 'ftm_country', 'model'])
    const rows = wrapper.findAll('.card-properties-entry')
    expect(rows).toHaveLength(3)
    expect(rows[1].text()).toContain('tm')
  })

  it('renders nothing for an empty property list', () => {
    const wrapper = mountProperties([])
    expect(wrapper.find('.entity-card-properties').exists()).toBe(true)
    expect(wrapper.findAll('.card-properties-entry')).toHaveLength(0)
  })
})
