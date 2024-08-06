import NamedEntitySectionMore from '@/components/NamedEntity/NamedEntitySection/NamedEntitySectionMore'

export default {
  title: 'Components/NamedEntity/NamedEntitySection/NamedEntitySectionMore',
  tags: ['autodocs'],
  component: NamedEntitySectionMore,
  argTypes: {
    category: {
      control: {
        type: 'select'
      },
      options: ['person', 'organization', 'location', 'email']
    }
  },
  args: {
    category: 'person'
  }
}

export const Default = {}
