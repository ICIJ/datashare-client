import EntityButton from '@/components/Entity/EntityButton'
import { ENTITY_CATEGORY } from '@/enums/entityCategories'

export default {
  title: 'Components/Entity/EntityButton',
  tags: ['autodocs'],
  component: EntityButton,
  args: {
    entity: {
      mention: 'Elton John',
      length: 'Elton John'.length,
      offsets: [12e2, 13e2],
      category: ENTITY_CATEGORY.PERSON
    }
  }
}

export const Default = {}
