import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import EntityCard from '@/components/Entity/EntityCard/EntityCard'
import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'
import { useStructuredEntityModelStore } from '@/store/modules/structuredEntityModel'

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

  describe('with the ontology', () => {
    const ONTOLOGY = {
      name: 'ftm',
      version: '4.10.2',
      types: {
        Person: {
          name: 'Person',
          label: 'Person',
          featured: ['name', 'nationality', 'birthDate'],
          caption: ['name'],
          edge: null,
          properties: {
            name: { label: 'Name', range: null, stub: false },
            nationality: { label: 'Nationality', range: null, stub: false },
            birthDate: { label: 'Birth date', range: null, stub: false }
          }
        },
        Company: {
          name: 'Company',
          label: 'Company',
          featured: ['name', 'jurisdiction', 'registrationNumber'],
          caption: ['name'],
          edge: null,
          properties: {
            name: { label: 'Name', range: null, stub: false },
            jurisdiction: { label: 'Jurisdiction', range: null, stub: false },
            registrationNumber: { label: 'Registration number', range: null, stub: false }
          }
        },
        // `street` is the discriminating case: FtM labels it "Street address" while
        // humanizePropertyKey produces "Street", so asserting "Street" would pass with the
        // ontology deleted.
        Address: {
          name: 'Address',
          label: 'Address',
          featured: ['street', 'vatCode'],
          caption: ['full'],
          edge: null,
          properties: {
            full: { label: 'Full address', range: null, stub: false },
            street: { label: 'Street address', range: null, stub: false },
            vatCode: { label: 'VAT ID', range: null, stub: false }
          }
        }
      }
    }

    const company = {
      entityId: 'NK-2',
      model: 'ftm',
      entityType: 'Company',
      documentIds: ['doc-1'],
      properties: { ftm_name: ['Acme Ltd'], ftm_jurisdiction: ['lu'], ftm_registrationNumber: ['B-1234'] }
    }

    const mountWithOntology = (props) => {
      const core = CoreSetup.init().useAll().useRouterWithoutGuards()
      useStructuredEntityModelStore().model = ONTOLOGY
      return mount(EntityCard, { global: { plugins: core.plugins }, props: { project: 'banana-papers', ...props } })
    }

    it('derives its rows from the entity schema when given no property list', () => {
      const wrapper = mountWithOntology({
        entity: { ...entity, properties: { ftm_name: ['Jane'], ftm_nationality: ['fr'] } }
      })
      expect(wrapper.findComponent(EntityCardProperties).props('properties')).toContain('ftm_nationality')
      expect(wrapper.findComponent(EntityCardProperties).props('properties')).not.toContain('ftm_registrationNumber')
    })

    // The design mockup shows exactly this: one list, different rows per card.
    it('renders different rows for two entities of different schemata', () => {
      const asPerson = mountWithOntology({ entity }).findComponent(EntityCardProperties).props('properties')
      const asCompany = mountWithOntology({ entity: company }).findComponent(EntityCardProperties).props('properties')
      expect(asPerson).not.toEqual(asCompany)
      expect(asCompany).toContain('ftm_jurisdiction')
    })

    it('uses an explicit property list when one is given', () => {
      const wrapper = mountWithOntology({ entity, properties: ['name', 'model'] })
      expect(wrapper.findComponent(EntityCardProperties).props('properties')).toEqual(['name', 'model'])
    })

    it('labels a row from the ontology, not from the humanized key', () => {
      const wrapper = mountWithOntology({
        entity: {
          entityId: 'NK-3',
          model: 'ftm',
          entityType: 'Address',
          documentIds: ['doc-1'],
          properties: { ftm_full: ['1 Main St'], ftm_street: ['Main St'], ftm_vatCode: ['LU123'] }
        }
      })
      // humanizePropertyKey would give "Street" and "Vat code" for these two keys.
      expect(wrapper.text()).toContain('Street address')
      expect(wrapper.text()).toContain('VAT ID')
    })
  })
})
