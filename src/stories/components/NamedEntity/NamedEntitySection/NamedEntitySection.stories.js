import NamedEntitySection from '@/components/NamedEntity/NamedEntitySection/NamedEntitySection'

export default {
  title: 'Components/NamedEntity/NamedEntitySection/NamedEntitySection',
  tags: ['autodocs'],
  component: NamedEntitySection,
  argTypes: {
    category: {
      control: {
        type: 'select'
      },
      options: ['person', 'organization', 'location', 'email']
    }
  },
  args: {
    category: 'person',
    count: 4,
    hasMore: true,
    entries: [
      {
        mention: 'Elton John',
        length: 'Elton John'.length,
        offsets: [12e2, 13e2],
        category: 'PERSON'
      },
      {
        mention: 'John Doe',
        length: 'John Doe'.length,
        offsets: [13e2, 14e2],
        category: 'PERSON'
      },
      {
        mention: 'Jane Doe',
        length: 'Jane Doe'.length,
        offsets: [14e2, 15e2],
        category: 'PERSON'
      }
    ]
  }
}

export const Default = {}
