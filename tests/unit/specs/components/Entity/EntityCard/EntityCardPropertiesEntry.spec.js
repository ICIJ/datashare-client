import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityCardPropertiesEntry from '@/components/Entity/EntityCard/EntityCardPropertiesEntry'
import EntityCardPropertiesEntrySourceDocument from '@/components/Entity/EntityCard/EntityCardPropertiesEntrySourceDocument'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

const entity = {
  entityId: 'NK-7f3a',
  model: 'ftm',
  entityType: 'Person',
  documentIds: ['doc-1', 'doc-2'],
  properties: { ftm_name: ['Jane Doe', 'J. Doe'], ftm_country: ['tm'] }
}

// RouterLinkDocument resolves an href through the router, which useAll() does not install.
// RouterLinkDocument.spec.js adds it the same way.
const mountWith = (component, props) => {
  const core = CoreSetup.init().useAll().useRouterWithoutGuards()
  return mount(component, { global: { plugins: core.plugins }, props })
}

describe('EntityCardPropertiesEntry.vue', () => {
  it('renders every value of a multi-valued property', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'ftm_name' })
    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('J. Doe')
  })

  it('labels an unmapped model property with its humanized key', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'ftm_country' })
    expect(wrapper.find('.visually-hidden').text()).toBe('Country:')
  })

  it('falls back to a dash when the entity does not carry the property', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'ftm_birthDate' })
    expect(wrapper.find('.card-properties-entry__value').text()).toBe('\u2014')
  })

  it('reads a root field such as entityType, not only a model property', () => {
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity, property: 'entityType' })
    expect(wrapper.text()).toContain('Person')
  })
})

describe('EntityCardPropertiesEntrySourceDocument.vue', () => {
  it('links every source document', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity,
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(2)
  })

  it('links a repeated document id only once', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity: { ...entity, documentIds: ['doc-1', 'doc-1'] },
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(1)
  })

  it('skips a blank document id rather than linking an undefined route', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity: { ...entity, documentIds: [null, '', 'doc-1'] },
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(1)
  })

  // vue-router rejects an empty required param, so a project that resolves to no index cannot
  // produce a document route at all. The ids stay readable instead of throwing.
  it('renders the ids as plain text when there is no index to link against', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity,
      property: 'sourceDocument',
      index: ''
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(0)
    expect(wrapper.text()).toContain('doc-1')
    expect(wrapper.text()).toContain('doc-2')
  })

  it('renders a dash and no link when the entity has no source document', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity: { ...entity, documentIds: [] },
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(0)
    expect(wrapper.text()).toContain('\u2014')
  })
})
