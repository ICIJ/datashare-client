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

  it('renders every value when there are no more than three', () => {
    const many = { ...entity, properties: { ftm_alias: ['a', 'b', 'c'] } }
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity: many, property: 'ftm_alias' })
    expect(wrapper.find('.entity-card-properties-entry__values').text()).toBe('a, b, c')
  })

  it('caps the list at three values and marks the rest with an ellipsis', () => {
    const many = { ...entity, properties: { ftm_alias: ['a', 'b', 'c', 'd', 'e'] } }
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity: many, property: 'ftm_alias' })
    // The visible span only: the value container also holds the visually-hidden full list.
    expect(wrapper.find('.entity-card-properties-entry__values').text()).toBe('a, b, c\u2026')
  })

  it('carries the full list as a tooltip title when it is capped', () => {
    const many = { ...entity, properties: { ftm_alias: ['a', 'b', 'c', 'd', 'e'] } }
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity: many, property: 'ftm_alias' })
    expect(wrapper.find('.entity-card-properties-entry__values').attributes('title')).toBe('a, b, c, d, e')
  })

  it('carries no tooltip title when nothing is hidden', () => {
    const few = { ...entity, properties: { ftm_alias: ['a', 'b'] } }
    const wrapper = mountWith(EntityCardPropertiesEntry, { entity: few, property: 'ftm_alias' })
    expect(wrapper.find('.entity-card-properties-entry__values').attributes('title')).toBeUndefined()
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

  // In Datashare, routing is the ROOT document id (RouterLinkBatchSearchResult passes
  // item.rootId, and Document.rootUrl fetches by this.routing). The entities index carries no
  // root id, so asserting the document's own id as its routing is wrong for any embedded
  // document. Omitting it is equivalent for root documents, because document.js falls back to
  // `routing || id`, and it stops claiming a routing this component cannot know.
  it('asserts no routing, which it cannot know from the entities index', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity,
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findComponent(RouterLinkDocument).props('routing')).toBeUndefined()
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
  // The three-value cap lives in EntityCardPropertiesEntry's default slot, and this component
  // replaces that slot: an entity cited by 50 documents would otherwise render 50 links in one
  // card. A country or a large company reaches hundreds.
  it('links at most three source documents and counts the rest', () => {
    const many = { ...entity, documentIds: ['d1', 'd2', 'd3', 'd4', 'd5'] }
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity: many,
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.findAllComponents(RouterLinkDocument)).toHaveLength(3)
    expect(wrapper.text()).toContain('+2')
  })

  it('caps the plain-text ids too when there is no index to link against', () => {
    const many = { ...entity, documentIds: ['d1', 'd2', 'd3', 'd4', 'd5'] }
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity: many,
      property: 'sourceDocument',
      index: ''
    })
    expect(wrapper.findAll('.entity-card-properties-entry-source-document__id')).toHaveLength(3)
    expect(wrapper.text()).toContain('+2')
  })

  it('shows no overflow marker when every source document fits', () => {
    const wrapper = mountWith(EntityCardPropertiesEntrySourceDocument, {
      entity,
      property: 'sourceDocument',
      index: 'local-datashare'
    })
    expect(wrapper.text()).not.toContain('+')
  })

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
