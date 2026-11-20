import { vueRouter } from 'storybook-vue3-router'

import EntityCard from '@/components/Entity/EntityCard/EntityCard'

const routes = [
  { path: '/', name: 'document' },
  { path: '/ds', name: 'document-standalone' },
  { path: '/project/:name', name: 'project.view' }
]

// The shape EntitiesIndexRebuilder writes into the "<project>.entities" index: namespaced,
// always-array property values, the entity's own fields at the root.
const entity = {
  entityId: 'NK-7f3a2c91',
  model: 'ftm',
  entityType: 'Person',
  modelVersions: ['3.5.9'],
  documentIds: ['e1f2a3b4c5d6', 'a9b8c7d6e5f4'],
  properties: {
    ftm_name: ['Mr Yazmurad N Seryaev', 'Y. Seryaev'],
    ftm_country: ['Turkmenistan'],
    ftm_birthDate: ['1954-03-12'],
    ftm_position: ['Head of Mission'],
    ftm_sourceUrl: ['https://example.org/heads-of-mission.csv']
  }
}

const properties = [
  'name',
  'entityType',
  'ftm_country',
  'ftm_birthDate',
  'ftm_position',
  'sourceDocument',
  'model',
  'project'
]

export default {
  title: 'Components/Entity/EntityCard/EntityCard',
  decorators: [vueRouter(routes)],
  component: EntityCard,
  tags: ['autodocs'],
  argTypes: {
    properties: {
      control: 'check',
      options: properties
    }
  },
  args: {
    entity,
    project: 'banana-papers',
    index: 'banana-papers',
    properties,
    active: false,
    selected: false,
    selectMode: false
  },
  render: args => ({
    components: { EntityCard },
    setup: () => ({ args }),
    template: `<entity-card v-bind="args" />`
  })
}

export const Default = {}

export const Active = { args: { active: true } }

// The heterogeneous case: a second entity in the same dataset carrying none of the properties the
// first one has. Every missing row must render the dash placeholder.
export const SparseEntity = {
  args: {
    entity: {
      entityId: 'NK-00ff11',
      model: 'ftm',
      entityType: 'Company',
      modelVersions: ['3.5.9'],
      documentIds: ['e1f2a3b4c5d6'],
      properties: {}
    }
  }
}

// A common entity, a country or a large company, is cited by many documents. The row caps at
// three and counts the rest rather than growing the card without bound.
export const ManySourceDocuments = {
  args: {
    entity: {
      ...entity,
      documentIds: Array.from({ length: 12 }, (_, i) => `e1f2a3b4c5d${String(i).padStart(2, '0')}`)
    }
  }
}

// No source document, which the index does not forbid even though statements always carry one.
export const NoSourceDocument = {
  args: {
    entity: { ...entity, documentIds: [] }
  }
}
