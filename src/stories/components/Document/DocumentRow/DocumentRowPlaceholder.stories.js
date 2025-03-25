import PageTable from '@/components/PageTable/PageTable'
import DocumentRowPlaceholder from '@/components/Document/DocumentRow/DocumentRowPlaceholder'

export default {
  title: 'Components/Document/DocumentRow/DocumentRowPlaceholder',
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
  component: DocumentRowPlaceholder,
  tags: ['autodocs'],
  argTypes: {
    properties: {
      control: 'check',
      options: [
        'thumbnail',
        'title',
        'path',
        'author',
        'highlights',
        'creationDate',
        'contentLength',
        'contentTextLength',
        'contentType',
        'language',
        'extractionLevel',
        'tags',
        'project'
      ]
    }
  },
  args: {
    properties: ['title', 'contentLength', 'contentType', 'project'],
    repeat: 10
  }
}

export const Default = {}
