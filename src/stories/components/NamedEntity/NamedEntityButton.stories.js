import NamedEntityButton from '@/components/NamedEntity/NamedEntityButton'

export default {
  title: 'Components/NamedEntity/NamedEntityButton',
  tags: ['autodocs'],
  component: NamedEntityButton,
  args: {
    namedEntity: {
      mention: 'Elton John',
      length: 'Elton John'.length,
      offsets: [12e2, 13e2],
      category: 'PERSON'
    }
  }
}

export const Default = {}
