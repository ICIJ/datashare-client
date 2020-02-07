import { namedEntityCategoryTranslation } from '@/store/filters/FilterNamedEntity'

export { default as FilterContentType } from './FilterContentType'
export { default as FilterDate } from './FilterDate'
export { default as FilterDateRange } from './FilterDateRange'
export { default as FilterExtractionLevel } from './FilterExtractionLevel'
export { default as FilterLanguage } from './FilterLanguage'
export { default as FilterNamedEntity } from './FilterNamedEntity'
export { default as FilterPath } from './FilterPath'
export { default as FilterStarred } from './FilterStarred'
export { default as FilterText } from './FilterText'
export { default as FilterYesNo } from './FilterYesNo'

export default [
  {
    type: 'FilterStarred',
    options: {
      name: 'starred',
      key: '_id',
      icon: 'star'
    }
  },
  {
    type: 'FilterText',
    options: {
      name: 'tags',
      key: 'tags',
      icon: 'tags',
      isSearchable: true
    }
  },
  {
    type: 'FilterContentType',
    options: {
      name: 'contentType',
      key: 'contentType',
      icon: 'file',
      isSearchable: true
    }
  },
  {
    type: 'FilterDateRange',
    options: {
      name: 'creationDate',
      key: 'metadata.tika_metadata_creation_date',
      icon: 'calendar-alt'
    }
  },
  {
    type: 'FilterLanguage',
    options: {
      name: 'language',
      key: 'language',
      icon: 'language'
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityPerson',
      key: 'byMentions',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityPerson
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityOrganization',
      key: 'byMentions',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityOrganization
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityLocation',
      key: 'byMentions',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityLocation
    }
  },
  {
    type: 'FilterPath',
    options: {
      name: 'path',
      key: 'byDirname',
      icon: 'hdd'
    }
  },
  {
    type: 'FilterExtractionLevel',
    options: {
      name: 'extractionLevel',
      key: 'extractionLevel',
      icon: 'paperclip'
    }
  },
  {
    type: 'FilterDate',
    options: {
      name: 'indexingDate',
      key: 'extractionDate',
      icon: 'calendar-plus'
    }
  }
]
