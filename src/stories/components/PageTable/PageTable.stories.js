import PageTable from '@/components/PageTable/PageTable'
import PageTableTh from '@/components/PageTable/PageTableTh'
import PageTableTr from '@/components/PageTable/PageTableTr'

export default {
  title: 'Components/PageTable/PageTable',
  tags: ['autodocs'],
  component: PageTable,
  args: {
    selectMode: true
  },
  render: (args) => ({
    components: {
      PageTable,
      PageTableTh,
      PageTableTr
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
          <page-table-th label="Name of the document" emphasis />
          <page-table-th label="Page(s)" icon="files" emphasis />
          <page-table-th label="File type" icon="file" emphasis />
          <page-table-th label="Project" icon="circles-three-plus" />
          <page-table-th label="Author" icon="user-circle" />
          <page-table-th label="Created on" icon="calendar-blank" />
        </template>
        <page-table-tr v-model:active="activeRows[0]">
          <td><a href="#" target="_self">Inter IKEA Investment S.à r.l._cover letter 2010-2011 tax returns.pdf</a></td>
          <td>56</td>
          <td>PDF</td>
          <td>Project 1</td>
          <td>John Doe</td>
          <td>2021-09-01</td>
        </page-table-tr>
        <page-table-tr v-model:active="activeRows[1]">
          <td><a href="#" target="_self">Business Plan 2016 for investors Grughtel Corporation SA</a></td>
          <td>57</td>
          <td>DOCX</td>
          <td>Project 2</td>
          <td>Jane Doe</td>
          <td>2021-09-02</td>
        </page-table-tr>
        <page-table-tr v-model:active="activeRows[2]">
          <td><a href="#" target="_self">Notif_C3.059249_Inter IKEA Finance SA_01062010.pdf</a></td>
          <td>4</td>
          <td>XLSX</td>
          <td>Project 3</td>
          <td>Jan Doe</td>
          <td>2021-09-03</td>
        </page-table-tr>
        <page-table-tr v-model:active="activeRows[3]">
          <td><a href="#" target="_self">Inter Ikea Holding S.A._C4.135848_2011_CIT.MBT.NWT Return_EN.pdf</a></td>
          <td>3</td>
          <td>PDF</td>
          <td>Project 4</td>
          <td>Jin Doe</td>
          <td>2021-09-04</td>
        </page-table-tr>
      </page-table>
    `
  })
}


export const Default = {}
