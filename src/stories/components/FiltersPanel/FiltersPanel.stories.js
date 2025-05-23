import FiltersPanelToggler from '@/components/FiltersPanel/FiltersPanelToggler'
import FiltersPanelSearch from '@/components/FiltersPanel/FiltersPanelSearch'
import FiltersPanelSection from '@/components/FiltersPanel/FiltersPanelSection'
import FiltersPanelSectionTitle from '@/components/FiltersPanel/FiltersPanelSectionTitle'
import FiltersPanelSectionFilter from '@/components/FiltersPanel/FiltersPanelSectionFilter'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FiltersPanelSectionFilterActions from '@/components/FiltersPanel/FiltersPanelSectionFilterActions'

export default {
  title: 'Components/FiltersPanel',
  tags: ['autodocs'],
  component: { name: 'FiltersPanel' },
  argTypes: {},
  args: {
    collapseTags: false
  },
  render: (args) => ({
    components: {
      FiltersPanelToggler,
      FiltersPanelSearch,
      FiltersPanelSection,
      FiltersPanelSectionTitle,
      FiltersPanelSectionFilter,
      FiltersPanelSectionFilterEntry,
      FiltersPanelSectionFilterActions
    },
    data() {
      return {
        values: {}
      }
    },
    computed: {
      count() {
        return Object.values(this.values).filter((v) => v).length
      }
    },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 320px; background-color: var(--bs-tertiary-bg-subtle);" class="p-3">
        <filters-panel-toggler class="mb-5" />
        <filters-panel-search class="mb-5" />
        <filters-panel-section title="Documents info">
          <filters-panel-section-filter title="Project" icon="circles-three-plus" collapse />
          <filters-panel-section-filter title="Path" icon="tree-structure" collapse />
          <filters-panel-section-filter title="File type" icon="file-text" collapse />
          <filters-panel-section-filter title="Creation date" icon="calendar-blank" collapse />
          <filters-panel-section-filter title="Language" icon="globe-hemisphere-west" :count="4" collapse />
          <filters-panel-section-filter title="Indexing date" icon="calendar-plus" collapse />
          <filters-panel-section-filter title="Extraction lebel" icon="paperclip" collapse />
          <filters-panel-section-filter title="Has attachments" icon="paperclip" collapse />
        </filters-panel-section>
        <filters-panel-section title="User(s) data">
          <filters-panel-section-filter title="Starred" icon="star" collapse />
          <filters-panel-section-filter title="With note(s)" icon="note-blank" :count="1" collapse />
          <filters-panel-section-filter title="In your folder(s)" icon="folder-open" collapse />
          <filters-panel-section-filter title="Commmented by" icon="chats-teardrop" collapse />
          <filters-panel-section-filter title="Tags" icon="tag" :count="count" :collapse="args.collapseTags" @toggle="args.collapseTags = $event" search-placeholder="Search in tags">
            <filters-panel-section-filter-entry label="All" v-model="values['all']" :count="1874589" />
            <filters-panel-section-filter-entry label="colombia" v-model="values['colombia']" :count="89233" />
            <filters-panel-section-filter-entry label="mongolia" v-model="values['mongolia']" :count="9276" />
            <filters-panel-section-filter-entry label="japan" v-model="values['japan']" :count="8878" />
            <filters-panel-section-filter-entry label="russia" v-model="values['russia']" :count="1233" />
            <filters-panel-section-filter-entry label="france" v-model="values['france']" :count="437" />
            <filters-panel-section-filter-entry label="bolivia" v-model="values['bolivia']" :count="389" />
            <filters-panel-section-filter-entry label="estonia" v-model="values['estonia']" :count="388" />
            <filters-panel-section-filter-entry label="china" v-model="values['china']" :count="211" />
            <filters-panel-section-filter-entry label="usa" v-model="values['usa']" :count="210" />
            <filters-panel-section-filter-entry label="germany" v-model="values['germany']" :count="148" />
            <filters-panel-section-filter-entry label="sudan" v-model="values['sudan']" :count="135" />
            <filters-panel-section-filter-entry label="australia" v-model="values['australia']" :count="36" />
            <filters-panel-section-filter-entry label="south-africa" v-model="values['south-africa']" :count="15" />
          </filters-panel-section-filter>
          <filters-panel-section-filter title="Recommended by" icon="newspaper-clipping" collapse />
        </filters-panel-section>
        <filters-panel-section title="Named entities">
          <filters-panel-section-filter title="People" icon="users" collapse />
          <filters-panel-section-filter title="Organizations" icon="buildings" collapse />
          <filters-panel-section-filter title="Locations" icon="map-pin" collapse />
          <filters-panel-section-filter title="Email addresses" icon="at" collapse />
          <filters-panel-section-filter title="Phone numbers" icon="phone" collapse />
          <filters-panel-section-filter title="IBAN" icon="currency-circle-dollar" collapse />
        </filters-panel-section>
      </div>
    `
  })
}

export const Default = {}
