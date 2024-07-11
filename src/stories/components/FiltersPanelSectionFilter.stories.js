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
    collapse: false,
    hideContextualize: false,
    hideExclude: false,
    hideExpand: false,
    hideSort: false
  },
  render: (args) => ({
    components: {
      FiltersPanelSectionFilter,
      FiltersPanelSectionFilterEntry
    },
    setup: () => ({ args }),
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
    template: `
      <div class="p-5" style="background-color: var(--bs-light-bg-subtle);">
        <filters-panel-section-filter v-bind="args" :count="count" @toggle="args.collapse = $event">
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
      </div>
    `
  })
}

export const Default = {}
