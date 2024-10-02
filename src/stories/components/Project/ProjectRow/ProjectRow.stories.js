import { vueRouter } from 'storybook-vue3-router'

import PageTable from '@/components/PageTable/PageTable'
import PageTableTh from '@/components/PageTable/PageTableTh'
import ProjectRow from '@/components/Project/ProjectRow/ProjectRow'

const routes = [
  {
    path: '/project/:name',
    name: 'project.view.overview.insights'
  },
  {
    path: '/project/:name/edit',
    name: 'project.view.edit'
  },
  {
    path: '/project/:name/delete',
    name: 'project.view.delete'
  },
  {
    path: '/search',
    name: 'search'
  }
]

export default {
  title: 'Components/Project/ProjectRow/ProjectRow',
  decorators: [
    vueRouter(routes),
    () => ({
      components: {
        PageTable,
        PageTableTh
      },
      template: `
        <page-table>
          <template #colgroup>
            <col style="min-width: 200px" />
            <col style="min-width: 200px" />
          </template>
          <template #thead>
            <page-table-th label="Name of the project" icon="circles-three-plus" emphasis />
            <page-table-th label="Description" />
            <page-table-th label="Documents" icon="files" number />
            <page-table-th label="Updated on" icon="calendar-blank" />
            <page-table-th label="Links" hide-label />
            <page-table-th label="Actions" hide-label />
          </template>
          <story />
        </page-table>
      `
    })
  ],
  tags: ['autodocs'],
  component: ProjectRow,
  args: {
    project: {
      name: 'banana-papers',
      label: 'Banana Papers',
      logoUrl: 'https://media.icij.org/uploads/2018/04/Banana-Getty-PanamaPapers.jpg',
      description: 'A shoking exposé about bananas involved in a world-wide tax evasion scheme.',
      updateDate: '2024-08-07',
      documentsCount: 8.2e6
    }
  }
}

export const Default = {}

export const WithLongDescription = {
  args: {
    project: {
      name: 'citrus-confidential',
      label: 'Citrus Confidential',
      description: `
        A new investigation by ICIJ and 68 media partners exposes the sprawling
        citrus industry that has powered the Orange Julius regime as it dominates
        its neighbors — and undermines the zest of the West.
      `,
      updateDate: '2024-08-07',
      documentsCount: 7.26e3
    }
  }
}
