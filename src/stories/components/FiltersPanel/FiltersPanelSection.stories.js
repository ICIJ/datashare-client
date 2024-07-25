import FiltersPanelSection from '@/components/FiltersPanel/FiltersPanelSection'
import FiltersPanelSectionFilter from '@/components/FiltersPanel/FiltersPanelSectionFilter'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'

export default {
  title: 'Components/FiltersPanel/FiltersPanelSection',
  tags: ['autodocs'],
  component: {
    FiltersPanelSection
  },
  argTypes: {},
  args: {
    title: 'Documents info'
  },
  render: (args) => ({
    components: {
      FiltersPanelSection,
      FiltersPanelSectionFilter,
      FiltersPanelSectionFilterEntry
    },
    setup: () => ({ args }),
    template: `
      <div class="p-5" style="background-color: var(--bs-tertiary-bg-subtle);">
        <filters-panel-section :title="args.title">
          <filters-panel-section-filter title="Project" icon="circles-three-plus" collapse />
          <filters-panel-section-filter title="Path" icon="tree-structure" collapse />
          <filters-panel-section-filter title="File type" icon="file-text" collapse />
          <filters-panel-section-filter title="Creation date" icon="calendar-blank" collapse />
          <filters-panel-section-filter title="Language" icon="globe-hemisphere-west" collapse />
          <filters-panel-section-filter title="Indexing date" icon="calendar-plus" collapse />
          <filters-panel-section-filter title="Extraction lebel" icon="paperclip" collapse />
          <filters-panel-section-filter title="Has attachments" icon="paperclip" collapse />
        </filters-panel-section>
      </div>
    `
  })
}

export const Default = {}
