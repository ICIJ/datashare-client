import { namedEntityCategoryTranslation } from '@/store/filters/FilterNamedEntity'

export { default as FilterContentType } from './FilterContentType'
export { default as FilterDate } from './FilterDate'
export { default as FilterDateRange } from './FilterDateRange'
export { default as FilterExtractionLevel } from './FilterExtractionLevel'
export { default as FilterLanguage } from './FilterLanguage'
export { default as FilterNamedEntity } from './FilterNamedEntity'
export { default as FilterPath } from './FilterPath'
export { default as FilterRecommendedBy } from './FilterRecommendedBy'
export { default as FilterStarred } from './FilterStarred'
export { default as FilterText } from './FilterText'
export { default as FilterYesNo } from './FilterYesNo'

export default [
  {
    type: 'FilterStarred',
    options: {
      name: 'starred',
      key: '_id',
      icon: 'star',
      order: 10
    }
  },
  {
    type: 'FilterText',
    options: {
      name: 'tags',
      key: 'tags',
      icon: 'tags',
      isSearchable: true,
      order: 20
    }
  },
  {
    type: 'FilterRecommendedBy',
    options: {
      name: 'recommendedBy',
      key: '_id',
      icon: 'users',
      order: 30,
      fromElasticSearch: false
    }
  },
  {
    type: 'FilterContentType',
    options: {
      name: 'contentType',
      key: 'contentType',
      icon: 'file',
      isSearchable: true,
      order: 40
    }
  },
  {
    type: 'FilterDateRange',
    options: {
      name: 'creationDate',
      key: 'metadata.tika_metadata_creation_date',
      icon: 'calendar-alt',
      order: 50
    }
  },
  {
    type: 'FilterLanguage',
    options: {
      name: 'language',
      key: 'language',
      icon: 'language',
      order: 60
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityPerson',
      key: 'byMentions',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityPerson,
      order: 70
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityOrganization',
      key: 'byMentions',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityOrganization,
      order: 80
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityLocation',
      key: 'byMentions',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityLocation,
      order: 90
    }
  },
  {
    type: 'FilterPath',
    options: {
      name: 'path',
      key: 'byDirname',
      icon: 'hdd',
      order: 100
    }
  },
  {
    type: 'FilterExtractionLevel',
    options: {
      name: 'extractionLevel',
      key: 'extractionLevel',
      icon: 'paperclip',
      order: 110
    }
  },
  {
    type: 'FilterDate',
    options: {
      name: 'indexingDate',
      key: 'extractionDate',
      icon: 'calendar-plus',
      order: 120
    }
  }
]
