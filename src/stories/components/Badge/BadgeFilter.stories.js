import BadgeFilter from '@/components/Badge/BadgeFilter'
import { withPinia } from '~storybook/decorators/pinia'

export default {
  decorators: [withPinia()],
  title: 'Components/Badge/BadgeFilter',
  component: BadgeFilter,
  tags: ['autodocs'],
  args: {
    name: 'contentType',
    value: 'application/pdf'
  }
}

export const Default = {}

export const WithMutlipleValues = {
  args: {
    value: ['application/pdf', 'image/wmf']
  }
}

export const WithStarred = {
  args: {
    name: 'starred',
    value: true
  }
}

export const WithTags = {
  args: {
    name: 'tags',
    value: ['tag1', 'tag2']
  }
}

export const WithRecommendedBy = {
  args: {
    name: 'recommendedBy',
    value: ['Batman', 'Robin', 'Joker']
  }
}

export const WithPath = {
  args: {
    name: 'path',
    value: 'path/to/file'
  }
}

export const WithLanguage = {
  args: {
    name: 'language',
    value: 'ENGLISH'
  }
}

export const WithCreationDate = {
  args: {
    name: 'creationDate',
    value: [['2017-05-08', '2024-08-01']]
  }
}

export const WithCreationDateTs = {
  args: {
    name: 'creationDate',
    value: [[1167631200000, 1393843589921]]
  }
}

export const WithNamedEntityPerson = {
  args: {
    name: 'namedEntityPerson',
    value: 'John Doe'
  }
}

export const WithExtractionLevel = {
  args: {
    name: 'extractionLevel',
    value: 0
  }
}

export const WithIndexingDate = {
  args: {
    name: 'indexingDate',
    value: '2021-01-01'
  }
}
