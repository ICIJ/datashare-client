import { PhosphorIcon } from '@icij/murmur-next'

import PathView from '@/components/PathView/PathView'
import PathViewEntry from '@/components/PathView/PathViewEntry'
import PathViewEntryMore from '@/components/PathView/PathViewEntryMore'
import ProjectLabel from '@/components/Project/ProjectLabel'

export default {
  title: 'Components/PathView/PathView',
  tags: ['autodocs'],
  component: PathView,
  args: {
    query: '',
    compact: false,
    selectMode: false,
    noLabel: false,
    noSearch: false
  },
  render: (args) => ({
    components: {
      PathView,
      PathViewEntry,
      PathViewEntryMore,
      PhosphorIcon,
      ProjectLabel
    },
    setup: () => ({ args }),
    template: `
      <path-view v-bind="args" @update:query="args.query = $event">
        <path-view-entry name="Flowera" :documents="9104" :directories="3" :size="2110000000">
          <template #name>
            <div class="text-truncate">
              <phosphor-icon name="circles-three-plus" class="me-1" />
              <project-label project="Flowera" hide-thumbnail />
            </div>
          </template>
          <path-view-entry name="Contract" :documents="2109" :directories="4" :size="1010000000">
            <path-view-entry name="2021" :documents="1567" :directories="3" :size="500000000">
              <path-view-entry name="Note" collapse :documents="678" :directories="4" :size="76000000" />
              <path-view-entry name="Signature" collapse  :documents="142" :directories="4" :size="378000000" />
              <path-view-entry name="Others" :documents="747" :directories="4" :size="54000000">
                <path-view-entry name="Images" collapse :documents="36" :directories="7" :size="8000000" />
                <path-view-entry name="Attachments" collapse :documents="356" :directories="1" :size="5000000" />
                <path-view-entry name="ID Cards" collapse :documents="145" :directories="6" :size="4000000" />
                <path-view-entry name="Permits" collapse :documents="210" :directories="0" :size="7000000" />
                <path-view-entry name="Balance Sheets" collapse :documents="34" :directories="0" :size="400000" />
                <path-view-entry-more :total="14" :per-page="5" class="mx-3 my-2" />
              </path-view-entry>
            </path-view-entry>
            <path-view-entry name="2020" collapse />
            <path-view-entry name="2019" collapse />
            <path-view-entry name="2018" collapse />
          </path-view-entry>
        </path-view-entry>
      </path-view>
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
