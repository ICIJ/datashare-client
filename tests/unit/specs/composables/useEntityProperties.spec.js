import { toValue } from 'vue'
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import { useStructuredEntityModelStore } from '@/store/modules/structuredEntityModel'
import {
  featuredProperties,
  propertyLabel,
  useEntityProperties,
  entityPropertyValues,
  entityCaption,
  humanizePropertyKey
} from '@/composables/useEntityProperties'

const entity = {
  entityId: 'NK-7f3a',
  model: 'ftm',
  entityType: 'Person',
  modelVersions: ['3.5.9'],
  documentIds: ['doc-1'],
  properties: {
    ftm_name: ['Jane Doe', 'J. Doe'],
    ftm_country: ['tm'],
    ftm_alias: []
  }
}

describe('humanizePropertyKey', () => {
  it('strips the model namespace and spaces out the camel case', () => {
    expect(humanizePropertyKey('ftm_birthDate')).toBe('Birth date')
  })

  it('keeps a key that carries no namespace', () => {
    expect(humanizePropertyKey('name')).toBe('Name')
  })

  it('returns an empty string for a missing key', () => {
    expect(humanizePropertyKey()).toBe('')
  })

  it('returns an empty string for a null key rather than throwing', () => {
    expect(humanizePropertyKey(null)).toBe('')
  })
})

describe('entityPropertyValues', () => {
  it('returns every value of a multi-valued model property', () => {
    expect(entityPropertyValues(entity, 'ftm_name')).toEqual(['Jane Doe', 'J. Doe'])
  })

  it('falls back to a root field when the key is not a model property', () => {
    expect(entityPropertyValues(entity, 'entityType')).toEqual(['Person'])
  })

  it('returns an empty array for a key the entity does not carry', () => {
    expect(entityPropertyValues(entity, 'ftm_incorporationDate')).toEqual([])
  })

  it('drops empty values so a present-but-blank property reads as absent', () => {
    expect(entityPropertyValues(entity, 'ftm_alias')).toEqual([])
  })

  it('tolerates a missing entity', () => {
    expect(entityPropertyValues(undefined, 'ftm_name')).toEqual([])
  })

  it('does not expose the properties bag itself as a value', () => {
    expect(entityPropertyValues(entity, 'properties')).toEqual([])
  })

  it('does not expose an inherited key as a value', () => {
    expect(entityPropertyValues(entity, 'constructor')).toEqual([])
    expect(entityPropertyValues(entity, 'toString')).toEqual([])
  })
})

describe('entityCaption', () => {
  it('uses the first value of the model name property', () => {
    expect(entityCaption(entity)).toBe('Jane Doe')
  })

  it('falls back to the entity id when there is no name', () => {
    expect(entityCaption({ entityId: 'NK-7f3a', model: 'ftm', properties: {} })).toBe('NK-7f3a')
  })
})

describe('useEntityProperties', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  function mountComposable() {
    let result
    const TestComponent = {
      setup() {
        result = useEntityProperties()
        return result
      },
      template: '<div></div>'
    }
    mount(TestComponent, { global: { plugins } })
    return result
  }

  it('resolves a known field with its own label', () => {
    const { item } = mountComposable()

    expect(toValue(item('sourceDocument').text)).toBe('Source document')
  })

  it('offers relevance and entity id as the only sort options', () => {
    const { sortByOptions } = mountComposable()
    const keys = [...new Set(sortByOptions.value.map(({ value: [key] }) => key))]
    expect(keys).toEqual(['_score', 'entityId'])
  })

  it('keeps relevance out of the card properties, it is a sort option only', () => {
    const { items } = mountComposable()
    expect(Object.keys(items)).not.toContain('relevance')
  })

  it('resolves an unmapped model property to a humanized label', () => {
    const { item } = mountComposable()
    const resolved = item('ftm_incorporationDate')

    expect(toValue(resolved.text)).toBe('Incorporation date')
    expect(resolved.icon).not.toBeNull()
  })
})

// A trimmed ontology in the shape GET /api/models/ftm returns.
const ONTOLOGY = {
  name: 'ftm',
  version: '4.10.2',
  types: {
    Person: {
      name: 'Person',
      label: 'Person',
      featured: ['name', 'nationality', 'birthDate'],
      caption: ['name', 'alias'],
      edge: null,
      properties: {
        name: { label: 'Name', range: null, stub: false },
        alias: { label: 'Alias', range: null, stub: false },
        nationality: { label: 'Nationality', range: null, stub: false },
        birthDate: { label: 'Birth date', range: null, stub: false },
        addressEntity: { label: 'Address', range: 'Address', stub: false },
        agencyClient: { label: 'Clients', range: 'Representation', stub: true }
      }
    },
    // Shaped like the live Address: featured and caption overlap on two properties, and
    // `street` has a label `humanizePropertyKey` cannot produce.
    Address: {
      name: 'Address',
      label: 'Address',
      featured: ['full', 'city', 'street', 'country'],
      caption: ['full', 'summary', 'city', 'remarks'],
      edge: null,
      properties: {
        full: { label: 'Full address', range: null, stub: false },
        city: { label: 'City', range: null, stub: false },
        street: { label: 'Street address', range: null, stub: false },
        country: { label: 'Country', range: null, stub: false },
        summary: { label: 'Summary', range: null, stub: false },
        remarks: { label: 'Remarks', range: null, stub: false }
      }
    },
    // One of the five types the real ontology ships with no featured list.
    Interest: { name: 'Interest', label: 'Interest', caption: [], edge: null, properties: {} },
    Stubby: {
      name: 'Stubby',
      label: 'Stubby',
      featured: ['agencyClient', 'birthDate'],
      caption: [],
      edge: null,
      properties: {
        agencyClient: { label: 'Clients', range: 'Representation', stub: true },
        birthDate: { label: 'Birth date', range: null, stub: false }
      }
    }
  }
}

const person = (properties = {}) => ({
  entityId: 'NK-1',
  model: 'ftm',
  entityType: 'Person',
  documentIds: ['doc-1'],
  properties
})

describe('the ontology-backed helpers', () => {
  // These helpers read the store directly rather than through the composable, so they need an
  // active pinia but no mounted component.
  const withOntology = (ontology = ONTOLOGY) => {
    CoreSetup.init().useAll()
    const store = useStructuredEntityModelStore()
    store.model = ontology
    return store
  }

  describe('propertyLabel', () => {
    it('uses the ontology label for a known property', () => {
      withOntology()
      expect(propertyLabel('Person', 'ftm_birthDate')).toBe('Birth date')
    })

    it('falls back to the humanized key when the ontology is absent', () => {
      withOntology(null)
      expect(propertyLabel('Person', 'ftm_vatCode')).toBe('Vat code')
    })

    it('falls back when the entity type is not in the ontology', () => {
      withOntology()
      expect(propertyLabel('Spaceship', 'ftm_birthDate')).toBe('Birth date')
    })
  })

  describe('featuredProperties', () => {
    it('returns the schema featured properties, namespaced', () => {
      withOntology()
      expect(featuredProperties(person({ ftm_name: ['Jane Doe'] }))).toEqual([
        'name',
        'entityType',
        'ftm_nationality',
        'ftm_birthDate',
        'sourceDocument',
        'model',
        'project'
      ])
    })

    it('drops a featured property the caption already shows', () => {
      withOntology()
      expect(featuredProperties(person({ ftm_name: ['Jane Doe'] }))).not.toContain('ftm_name')
    })

    // The caption fell back to the entity id, so nothing was shown twice and the empty name row
    // is informative rather than duplicated.
    it('keeps the name row when the caption could not use it', () => {
      withOntology()
      expect(featuredProperties(person())).toContain('ftm_name')
    })

    // Only the property the caption actually used is dropped. Excluding every caption CANDIDATE
    // loses real data: on the live Address, `full` and `city` are both candidates, so a card
    // showed neither even when `city` held the only value it had.
    it('drops only the caption property that was actually used', () => {
      withOntology()
      const address = { ...person(), entityType: 'Address', properties: { ftm_full: ['1 Main St'], ftm_city: ['Luxembourg'] } }
      const rows = featuredProperties(address)
      expect(rows).not.toContain('ftm_full')
      expect(rows).toContain('ftm_city')
      expect(rows).toContain('ftm_street')
    })

    it('drops the second caption candidate when the first has no value', () => {
      withOntology()
      const address = { ...person(), entityType: 'Address', properties: { ftm_city: ['Luxembourg'] } }
      const rows = featuredProperties(address)
      expect(rows).not.toContain('ftm_city')
      expect(rows).toContain('ftm_full')
    })

    it('never returns a stub property', () => {
      withOntology()
      const entity = { ...person(), entityType: 'Stubby' }
      expect(featuredProperties(entity)).not.toContain('ftm_agencyClient')
      expect(featuredProperties(entity)).toContain('ftm_birthDate')
    })

    it('returns only the datashare rows for a type with no featured list', () => {
      withOntology()
      const entity = { ...person(), entityType: 'Interest' }
      expect(featuredProperties(entity)).toEqual(['name', 'entityType', 'sourceDocument', 'model', 'project'])
    })

    it('returns only the datashare rows when the ontology failed to load', () => {
      withOntology(null)
      expect(featuredProperties(person())).toEqual(['name', 'entityType', 'sourceDocument', 'model', 'project'])
    })
  })

  // The rows now differ per schema, so a card that never names its schema leaves a user with no
  // way to tell why two cards in one list look different.
  it('names the schema on every card', () => {
    withOntology()
    expect(featuredProperties(person())).toContain('entityType')
    expect(featuredProperties({ ...person(), entityType: 'Interest' })).toContain('entityType')
  })

  describe('entityCaption with the ontology', () => {
    it('uses the first caption property that has a value', () => {
      const store = withOntology()
      const entity = person({ ftm_alias: ['Jane D.'] })
      expect(entityCaption(entity, store.type('Person'))).toBe('Jane D.')
    })

    it('falls back to the entity id when no caption property has a value', () => {
      const store = withOntology()
      expect(entityCaption(person(), store.type('Person'))).toBe('NK-1')
    })

    // So no component has to reach into the ontology store to caption an entity.
    it('resolves the type itself when the caller passes none', () => {
      withOntology()
      expect(entityCaption(person({ ftm_alias: ['Jane D.'] }))).toBe('Jane D.')
    })
  })
})
