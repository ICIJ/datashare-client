import PageTable from '@/components/PageTable/PageTable'
import ProjectRowPlaceholder from '@/components/Project/ProjectRow/ProjectRowPlaceholder'

export default {
  title: 'Components/Project/ProjectRow/ProjectRowPlaceholder',
  decorators: [
    () => ({
      components: { PageTable },
      template: `
        <page-table>
          <story />
        </page-table>
      `
    })
  ],
  component: ProjectRowPlaceholder,
  tags: ['autodocs'],
  argTypes: {
    properties: {
      control: 'check',
      options: ['name']
    }
  },
  args: {
    properties: ['label', 'description', 'documentsCount', 'updateDate'],
    repeat: 10
  }
}

export const Default = {}
