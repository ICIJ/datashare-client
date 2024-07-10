import FiltersPanelSection from '@/components/FiltersPanelSection.vue'
import FiltersPanelSectionFilter from '@/components/FiltersPanelSectionFilter.vue'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanelSectionFilterEntry.vue'

export default {
  title: 'Components/FiltersPanel/Section',
  tags: ['autodocs'],
  component: {
    FiltersPanelSection
  },
  argTypes: {},
  args: {
    modelValue: ''
  },
  render: (args) => ({
    components: {
      FiltersPanelSection,
      FiltersPanelSectionFilter,
      FiltersPanelSectionFilterEntry
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-light-bg-subtle);">
        <filters-panel-section title="Documents info">
          <filters-panel-section-filter title="Tags" icon="tag" :collapse="args.collapseFilters">
            <filters-panel-section-filter-entry label="russia" model-value :count="1233" />
            <filters-panel-section-filter-entry label="france" model-value :count="437" />
            <filters-panel-section-filter-entry label="china" model-value :count="211" />
            <filters-panel-section-filter-entry label="usa" :count="210" />
            <filters-panel-section-filter-entry label="germany" :count="148" />
            <filters-panel-section-filter-entry label="sudan" :count="135" />
            <filters-panel-section-filter-entry label="australia" :count="36" />
          </filters-panel-section-filter>
        </filter-panel-section>
      </div>
    `
  })
}

export const Default = {}
