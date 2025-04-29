import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

export default {
  title: 'Components/FiltersPanel/FiltersPanelSectionFilterEntry',
  tags: ['autodocs'],
  component: {
    FiltersPanelSectionFilterEntry
  },
  argTypes: {},
  args: {
    label: 'Portable Document Format (PDF)',
    count: 123456,
    modelValue: true
  },
  render: (args) => ({
    components: {
      FiltersPanelSectionFilterEntry
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-tertiary-bg-subtle);">
        <filters-panel-section-filter-entry v-bind="args" />
      </div>
    `
  })
}

export const Default = {}
