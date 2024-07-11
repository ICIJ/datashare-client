import FiltersPanelSectionFilterFooter from '@/components/FiltersPanelSectionFilterFooter'

export default {
  title: 'Components/FiltersPanel/Section/Filter/Footer',
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
      <div class="p-5" style="background-color: var(--bs-light-bg-subtle);">
        <filters-panel-section-filter-footer  v-bind="args" />
      </div>
    `
  })
}

export const Default = {}
