import FiltersPanelSearch from '@/components/FiltersPanelSearch.vue'

export default {
  title: 'Components/FiltersPanel/Search',
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
