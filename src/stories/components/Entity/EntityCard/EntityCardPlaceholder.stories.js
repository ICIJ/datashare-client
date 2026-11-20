import EntityCardPlaceholder from '@/components/Entity/EntityCard/EntityCardPlaceholder'

export default {
  title: 'Components/Entity/EntityCard/EntityCardPlaceholder',
  component: EntityCardPlaceholder,
  tags: ['autodocs'],
  args: {
    properties: ['name', 'entityType', 'sourceDocument', 'model', 'project'],
    repeat: 3
  },
  render: args => ({
    components: { EntityCardPlaceholder },
    setup: () => ({ args }),
    template: `<entity-card-placeholder v-bind="args" />`
  })
}

export const Default = {}
