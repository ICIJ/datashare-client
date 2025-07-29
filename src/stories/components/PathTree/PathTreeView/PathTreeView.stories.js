import { PhosphorIcon } from '@icij/murmur-next'

import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'
import PathTreeViewEntryMore from '@/components/PathTree/PathTreeView/PathTreeViewEntryMore'
import ProjectLabel from '@/components/Project/ProjectLabel'

export default {
  title: 'Components/PathTree/PathTreeView/PathTreeView',
  tags: ['autodocs'],
  component: PathTreeView,
  args: {
    query: '',
    compact: false,
    nested: true,
    selectMode: false,
    noLabel: false,
    noSearch: false
  },
  render: args => ({
    components: {
      PathTreeView,
      PathTreeViewEntry,
      PathTreeViewEntryMore,
      PhosphorIcon,
      ProjectLabel
    },
    setup: () => ({ args }),
    template: `
      <path-tree-view v-bind="args" @update:query="args.query = $event">
        <path-tree-view-entry :nested="args.nested" :level="0" name="Flowera" :documents="9104" :directories="3" :size="2110000000">
          <template #name>
            <div class="text-truncate">
              <phosphor-icon name="circles-three-plus" class="me-1" />
              <project-label project="Flowera" hide-thumbnail />
            </div>
          </template>
          <path-tree-view-entry :nested="args.nested" :level="1" name="Contract" :documents="2109" :directories="4" :size="1010000000">
            <path-tree-view-entry :nested="args.nested" :level="2" name="2021" :documents="1567" :directories="3" :size="500000000">
              <path-tree-view-entry :nested="args.nested" :level="3" name="Note" collapse :documents="678" :directories="4" :size="76000000" />
              <path-tree-view-entry :nested="args.nested" :level="4" name="Signature" collapse  :documents="142" :directories="4" :size="378000000" />
              <path-tree-view-entry :nested="args.nested" :level="4" name="Others" :documents="747" :directories="4" :size="54000000">
                <path-tree-view-entry :nested="args.nested" :level="5" name="Images" collapse :documents="36" :directories="7" :size="8000000" />
                <path-tree-view-entry :nested="args.nested" :level="5" name="Attachments" collapse :documents="356" :directories="1" :size="5000000" />
                <path-tree-view-entry :nested="args.nested" :level="5" name="ID Cards" collapse :documents="145" :directories="6" :size="4000000" />
                <path-tree-view-entry :nested="args.nested" :level="5" name="Permits" collapse :documents="210" :directories="0" :size="7000000" />
                <path-tree-view-entry :nested="args.nested" :level="5" name="Balance Sheets" collapse :documents="34" :directories="0" :size="400000" />
                <path-tree-view-entry-more :level="5" :total="14" :per-page="5" class="mx-3 my-2" />
              </path-tree-view-entry>
            </path-tree-view-entry>
            <path-tree-view-entry :level="2" :nested="args.nested" name="2020" collapse />
            <path-tree-view-entry :level="2" :nested="args.nested" name="2019" collapse />
            <path-tree-view-entry :level="2" :nested="args.nested" name="2018" collapse />
          </path-tree-view-entry>
        </path-tree-view-entry>
      </path-tree-view>
    `
  })
}

export const Default = {}

export const SelectMode = {
  args: {
    selectMode: true
  }
}

export const Compact = {
  args: {
    compact: true,
    noSearch: true,
    noLabel: true,
    selectMode: false
  }
}

export const CompactSelectMode = {
  args: {
    compact: true,
    noSearch: true,
    noLabel: true,
    selectMode: true
  }
}
