import NamedEntityButton from '@/components/NamedEntity/NamedEntityButton'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export default {
  title: 'Components/NamedEntity/NamedEntityButton',
  tags: ['autodocs'],
  component: NamedEntityButton,
  args: {
    namedEntity: {
      mention: 'Elton John',
      length: 'Elton John'.length,
      offsets: [12e2, 13e2],
      category: ENTITY_CATEGORY.PERSON
    }
  }
}

export const Default = {}
