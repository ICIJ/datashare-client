import FiltersPanelSectionFilter from '@/components/FiltersPanel/FiltersPanelSectionFilter'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'

export default {
  title: 'Components/FiltersPanel/FiltersPanelSectionFilter',
  tags: ['autodocs'],
  component: {
    FiltersPanelSectionFilter
  },
  argTypes: {},
  args: {
    title: 'Tags',
    icon: 'tag',
    collapse: false,
    flush: false,
    hideContextualize: false,
    hideExclude: false,
    hideExpand: false,
    hideSearch: false,
    hideSort: false,
    loading: false
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
      <div class="p-5" style="background-color: var(--bs-tertiary-bg-subtle);">
        <filters-panel-section-filter v-bind="args" :count="count" @toggle="args.collapse = $event" search-placeholder="Search tags">
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
      </div>
    `
  })
}

export const Default = {}

export const ForPath = {
  args: {
    title: 'Tags',
    icon: 'tag',
    collapse: false,
    flush: true,
    hideContextualize: false,
    hideExclude: false,
    hideExpand: false,
    hideSearch: false,
    hideSort: false
  },
  render: (args) => ({
    components: {
      FiltersPanelSectionFilter,
      PathTreeView,
      PathTreeViewEntry,
      PathTreeViewEntryMore
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
      <div class="p-5" style="background-color: var(--bs-tertiary-bg-subtle);">
        <filters-panel-section-filter v-bind="args" @toggle="args.collapse = $event" search-placeholder="Search paths" :count="count">
          <path-view compact no-search no-label select-mode>
            <path-tree-view-entry v-model:selected="values['Flowera']" name="Flowera" :documents="9104" :directories="3" :size="2110000000">
              <path-tree-view-entry v-model:selected="values['Flowera/Contract']" name="Contract" :documents="2109" :directories="4" :size="1010000000">
                <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021']" name="2021" :documents="1567" :directories="3" :size="500000000">
                  <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Note']" name="Note" collapse :documents="678" :directories="4" :size="76000000" />
                  <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Signature']" name="Signature" collapse  :documents="142" :directories="4" :size="378000000" />
                  <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Others']" name="Others" :documents="747" :directories="4" :size="54000000">
                    <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Others/Images']" name="Images" collapse :documents="36" :directories="7" :size="8000000" />
                    <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Others/Attachments']" name="Attachments" collapse :documents="356" :directories="1" :size="5000000" />
                    <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Others/ID']" name="ID Cards" collapse :documents="145" :directories="6" :size="4000000" />
                    <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Others/Permits']" name="Permits" collapse :documents="210" :directories="0" :size="7000000" />
                    <path-tree-view-entry v-model:selected="values['Flowera/Contract/2021/Others/Balance Sheets']" name="Balance Sheets" collapse :documents="34" :directories="0" :size="400000" />
                    <path-tree-view-entry-more :total="14" :per-page="5" class="mx-2 my-2" />
                  </path-tree-view-entry>
                </path-tree-view-entry>
                <path-tree-view-entry v-model:selected="values['Flowera/Contract/2020']" name="2020" collapse />
                <path-tree-view-entry v-model:selected="values['Flowera/Contract/2019']" name="2019" collapse />
                <path-tree-view-entry v-model:selected="values['Flowera/Contract/2018']" name="2018" collapse />
              </path-tree-view-entry>
            </path-tree-view-entry>
          </path-view>
        </filters-panel-section-filter>
      </div>
    `
  })
}
