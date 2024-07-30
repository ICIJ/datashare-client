import DisplayDatetime from '@/components/Display/DisplayDatetime'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayVisibility from '@/components/Display/DisplayVisibility'
import IconButton from '@/components/IconButton'
import PageTable from '@/components/PageTable/PageTable'
import PageTableTdActions from '@/components/PageTable/PageTableTdActions'
import PageTableTh from '@/components/PageTable/PageTableTh'
import PageTableTr from '@/components/PageTable/PageTableTr'
import ProjectLabel from '@/components/Project/ProjectLabel'

export default {
  title: 'Components/PageTable/PageTable',
  tags: ['autodocs'],
  component: PageTable,
  args: {
    selectMode: true
  },
  render: (args) => ({
    components: {
      IconButton,
      PageTable,
      PageTableTh,
      PageTableTr,
      PageTableTdActions,
      ProjectLabel,
      DisplayDatetime
    },
    data() {
      return {
        activeRows: {}
      }
    },
    setup: () => {
      return { args }
    },
    template: `
      <page-table v-bind="args">
        <template #thead>
          <page-table-th label="Name of the document" sortable emphasis sorted order="asc" />
          <page-table-th label="Page(s)" icon="files" sortable emphasis number />
          <page-table-th label="File type" icon="file" sortable emphasis />
          <page-table-th label="Project" icon="circles-three-plus" />
          <page-table-th label="Author" icon="user-circle" />
          <page-table-th label="Created" sortable icon="calendar-blank" />
          <page-table-th label="Actions" hide-label />
        </template>
        <page-table-tr v-model:active="activeRows[0]">
          <td><a href="#" target="_self">Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.pdf</a></td>
          <td class="text-end">56</td>
          <td>PDF</td>
          <td><project-label class="text-nowrap" project="Project 1" hide-thumbnail /></td>
          <td>John Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-01" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="star" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="download-simple" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="share-network" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrows-out-simple" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
        <page-table-tr v-model:active="activeRows[1]">
          <td><a href="#" target="_self">Business Plan 2016 for investors Grughtel Corporation SA</a></td>
          <td class="text-end">57</td>
          <td>DOCX</td>
          <td><project-label class="text-nowrap" project="Project 2" hide-thumbnail /></td>
          <td>Jane Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-02" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="star" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="download-simple" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="share-network" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrows-out-simple" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
        <page-table-tr v-model:active="activeRows[2]">
          <td><a href="#" target="_self">Notif_C3.059249_Inter IKEA Finance SA_01062010.pdf</a></td>
          <td class="text-end">4</td>
          <td>XLSX</td>
          <td><project-label class="text-nowrap" project="Project 3" hide-thumbnail /></td>
          <td>Jan Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-03" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="star" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="download-simple" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="share-network" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrows-out-simple" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
        <page-table-tr v-model:active="activeRows[3]">
          <td><a href="#" target="_self">Inter Ikea Holding S.A._C4.135848_2011_CIT.MBT.NWT Return_EN.pdf</a></td>
          <td class="text-end">3</td>
          <td>PDF</td>
          <td><project-label class="text-nowrap" project="Project 4" hide-thumbnail /></td>
          <td>Jin Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-04" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="star" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="download-simple" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="share-network" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrows-out-simple" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
      </page-table>
    `
  })
}

export const Default = {}

export const WithoutSelectMode = {
  render: () => ({
    components: {
      IconButton,
      PageTable,
      PageTableTh,
      PageTableTr,
      PageTableTdActions,
      ProjectLabel,
      DisplayStatus,
      DisplayVisibility,
      DisplayDatetime
    },
    template: `
      <page-table>
        <template #thead>
          <page-table-th label="Status" compact hide-label />
          <page-table-th label="Visibility" compact hide-label />
          <page-table-th label="Name of the batch search" emphasis sortable sorted />
          <page-table-th label="Queries" number icon="magnifying-glass" emphasis />
          <page-table-th label="Documents" number icon="text-align-justify" emphasis />
          <page-table-th label="Project" icon="circles-three-plus" />
          <page-table-th label="Author" icon="user-circle" />
          <page-table-th label="Created" icon="calendar-blank" sortable />
          <page-table-th label="Actions" hide-label />
        </template>
        <page-table-tr>
          <td><display-status value="queued" /></td>
          <td><display-visibility :value="true" /></td>
          <td><a href="#" target="_self">Richest people in EU</a></td>
          <td class="text-end">56</td>
          <td class="text-end">371</td>
          <td><project-label class="text-nowrap" project="Project 1" hide-thumbnail /></td>
          <td>John Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-01" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="magnifying-glass" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrow-clockwise" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="trash" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
        <page-table-tr>
          <td><display-status value="success" /></td>
          <td><display-visibility :value="false" /></td>
          <td><a href="#" target="_self">Demo Maxime</a></td>
          <td class="text-end">57</td>
          <td class="text-end">455</td>
          <td><project-label class="text-nowrap" project="Project 2" hide-thumbnail /></td>
          <td>Jane Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-02" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="magnifying-glass" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrow-clockwise" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="trash" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
        <page-table-tr>
          <td><display-status value="failure" /></td>
          <td><display-visibility :value="false" /></td>
          <td><a href="#" target="_self">Employees of company TYU</a></td>
          <td class="text-end">4</td>
          <td class="text-end">784</td>
          <td><project-label class="text-nowrap" project="Project 3" hide-thumbnail /></td>
          <td>Jan Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-03" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="magnifying-glass" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrow-clockwise" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="trash" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
        <page-table-tr>
          <td><display-status value="draft" /></td>
          <td><display-visibility :value="true" /></td>
          <td><a href="#" target="_self">Banks in Singapore </a></td>
          <td class="text-end">30</td>
          <td class="text-end">789</td>
          <td><project-label class="text-nowrap" project="Project 4" hide-thumbnail /></td>
          <td>Jin Doe</td>
          <td><display-datetime class="text-nowrap" value="2021-09-04" /></td>
          <page-table-td-actions>
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="magnifying-glass" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="arrow-clockwise" class="border-0 me-1" />
            <icon-button variant="outline-secondary" square hide-label size="sm" icon-left="trash" class="border-0 me-1" />
          </page-table-td-actions>
        </page-table-tr>
      </page-table>
    `
  })
}
