import FiltersPanelSearch from '@/components/FiltersPanel/FiltersPanelSearch'

export default {
  title: 'Components/FiltersPanel/FiltersPanelSearch',
  tags: ['autodocs'],
  component: {
    FiltersPanelSearch
  },
  argTypes: {},
  args: {
    modelValue: ''
  },
  render: (args) => ({
    components: {
      FiltersPanelSearch
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-light-bg-subtle);">
        <filters-panel-search v-model="args.modelValue" />
      </div>
    `
  })
}

export const Default = {}
