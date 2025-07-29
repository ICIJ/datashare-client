import FiltersPanelSectionFilterActions from '@/components/FiltersPanel/FiltersPanelSectionFilterActions'

export default {
  title: 'Components/FiltersPanel/FiltersPanelSectionFilterActions',
  tags: ['autodocs'],
  component: FiltersPanelSectionFilterActions,
  argTypes: {},
  args: {
    hideContextualize: false,
    hideExclude: false,
    hideShowMore: false,
    hideSort: false
  },
  render: args => ({
    components: {
      FiltersPanelSectionFilterActions
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-tertiary-bg-subtle);">
        <filters-panel-section-filter-actions  v-bind="args" />
      </div>
    `
  })
}

export const Default = {}
