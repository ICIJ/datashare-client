import FiltersPanelSectionFilter from '@/components/FiltersPanelSectionFilter.vue'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanelSectionFilterEntry.vue'

export default {
  title: 'Components/FiltersPanel/Section/Filter',
  tags: ['autodocs'],
  component: {
    FiltersPanelSectionFilter
  },
  argTypes: {},
  args: {
    title: 'Tags',
    icon: 'tag',
    collapse: false
  },
  render: (args) => ({
    components: {
      FiltersPanelSectionFilter,
      FiltersPanelSectionFilterEntry
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-light-bg-subtle);">
        <filters-panel-section-filter v-bind="args" @toggle="args.collapse = $event">
          <filters-panel-section-filter-entry label="russia" model-value :count="1233" />
          <filters-panel-section-filter-entry label="france" model-value :count="437" />
          <filters-panel-section-filter-entry label="china" model-value :count="211" />
          <filters-panel-section-filter-entry label="usa" :count="210" />
          <filters-panel-section-filter-entry label="germany" :count="148" />
          <filters-panel-section-filter-entry label="sudan" :count="135" />
          <filters-panel-section-filter-entry label="australia" :count="36" />
        </filters-panel-section-filter>
      </div>
    `
  })
}

export const Default = {}
