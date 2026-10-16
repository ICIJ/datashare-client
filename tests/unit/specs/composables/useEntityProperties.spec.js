import { toValue } from 'vue'
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import {
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

  it('resolves an unmapped model property to a humanized label', () => {
    const { item } = mountComposable()
    const resolved = item('ftm_incorporationDate')

    expect(toValue(resolved.text)).toBe('Incorporation date')
    expect(resolved.icon).not.toBeNull()
  })
})
