import NamedEntitySectionActions from '@/components/NamedEntity/NamedEntitySection/NamedEntitySectionActions'

export default {
  title: 'Components/NamedEntity/NamedEntitySection/NamedEntitySectionActions',
  tags: ['autodocs'],
  component: NamedEntitySectionActions,
  argTypes: {
    category: {
      control: {
        type: 'select'
      },
      options: ['person', 'organization', 'location', 'email']
    }
  },
  args: {
    category: 'people'
  }
}

export const Default = {}
