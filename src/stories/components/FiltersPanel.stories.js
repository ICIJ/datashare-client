import FiltersPanelToggler from "@/components/FiltersPanelToggler.vue"
import FiltersPanelSearch from "@/components/FiltersPanelSearch.vue"
import FiltersPanelSection from "@/components/FiltersPanelSection.vue"
import FiltersPanelSectionTitle from "@/components/FiltersPanelSectionTitle.vue"
import FiltersPanelSectionFilter from "@/components/FiltersPanelSectionFilter.vue"
import FiltersPanelSectionFilterEntry from "@/components/FiltersPanelSectionFilterEntry.vue"
import FiltersPanelSectionFilterFooter from "@/components/FiltersPanelSectionFilterFooter.vue"

export default {
  title: 'Components/FiltersPanel',
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: (args) => ({
    components: {
      FiltersPanelToggler,
      FiltersPanelSearch,
      FiltersPanelSection,
      FiltersPanelSectionTitle,
      FiltersPanelSectionFilter,
      FiltersPanelSectionFilterEntry,
      FiltersPanelSectionFilterFooter
    },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 320px; background-color: var(--bs-light-bg-subtle);" class="p-3">
        <filters-panel-toggler class="mb-5" />
        <filters-panel-search class="mb-5" />
        <filters-panel-section title="Documents info">
          <filters-panel-section-filter name="project" title="Project">
            <filters-panel-section-filter-entry label="Banana Papers" value="banana-papers" />
            <filters-panel-section-filter-entry label="Citrus Confidential" value="citrus-confidential" />
            <filters-panel-section-filter-entry label="FigCEN Files" value="figcen-files" />
          </filters-panel-section-filter>
          <filters-panel-section-filter name="contentType" title="File type">
            <filters-panel-section-filter-entry label="Portable Document Format (PDF)" value="application/pdf" />
            <filters-panel-section-filter-entry label="JPEG" value="image/jpg" />
            <filters-panel-section-filter-entry label="Excel 95-2003 Wordbook" value="application/vnd.ms-excel" />
          </filters-panel-section-filter>
        </filters-panel-section>
      </div>
    `
  })
}

export const Default = {}
