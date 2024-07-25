import FiltersPanelSectionFilterFooter from '@/components/FiltersPanel/FiltersPanelSectionFilterFooter'

export default {
  title: 'Components/FiltersPanel/FiltersPanelSectionFilterFooter',
  tags: ['autodocs'],
  component: FiltersPanelSectionFilterFooter,
  argTypes: {},
  args: {
    hideContextualize: false,
    hideExclude: false,
    hideShowMore: false,
    hideSort: false
  },
  render: (args) => ({
    components: {
      FiltersPanelSectionFilterFooter
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-tertiary-bg-subtle);">
        <filters-panel-section-filter-footer  v-bind="args" />
      </div>
    `
  })
}

export const Default = {}
