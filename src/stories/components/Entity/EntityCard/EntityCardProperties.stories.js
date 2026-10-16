import { vueRouter } from 'storybook-vue3-router'

import EntityCardProperties from '@/components/Entity/EntityCard/EntityCardProperties'

const routes = [
  { path: '/', name: 'document' },
  { path: '/ds', name: 'document-standalone' },
  { path: '/project/:name', name: 'project.view' }
]

const entity = {
  entityId: 'NK-7f3a2c91',
  model: 'ftm',
  entityType: 'Person',
  modelVersions: ['3.5.9'],
  documentIds: ['e1f2a3b4c5d6'],
  properties: {
    ftm_name: ['Mr Yazmurad N Seryaev', 'Y. Seryaev'],
    ftm_country: ['Turkmenistan'],
    ftm_incorporationDate: ['1999-01-04']
  }
}

export default {
  title: 'Components/Entity/EntityCard/EntityCardProperties',
  decorators: [vueRouter(routes)],
  component: EntityCardProperties,
  tags: ['autodocs'],
  args: {
    entity,
    project: 'banana-papers',
    index: 'banana-papers',
    properties: ['name', 'entityType', 'ftm_country', 'sourceDocument', 'model', 'project']
  },
  render: args => ({
    components: { EntityCardProperties },
    setup: () => ({ args }),
    template: `<entity-card-properties v-bind="args" />`
  })
}

export const Default = {}

// An ontology-free label: "ftm_incorporationDate" has no mapping anywhere, so it must read as
// "Incorporation date" through the humanizing fallback.
export const UnmappedProperty = {
  args: { properties: ['name', 'ftm_incorporationDate'] }
}

// Both values of a multi-valued property have to be visible.
export const MultiValuedProperty = {
  args: { properties: ['ftm_name'] }
}
