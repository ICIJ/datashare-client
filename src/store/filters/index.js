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
export { default as FilterTag } from './FilterTag'
export { default as FilterText } from './FilterText'

export default [
  {
    type: 'FilterStarred',
    options: {
      name: 'starred',
      key: '_id',
      icon: 'star',
      order: 10,
      preference: 'filter-starred'
    }
  },
  {
    type: 'FilterTag',
    options: {
      name: 'tags',
      key: 'tags',
      icon: 'tag',
      isSearchable: true,
      order: 20,
      preference: 'filter-tags'
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
    type: 'FilterPath',
    options: {
      name: 'path',
      key: 'byDirname',
      icon: 'tree-structure',
      order: 35,
      isSearchable: true,
      fromElasticSearch: false,
      preference: 'filter-path'
    }
  },
  {
    type: 'FilterContentType',
    options: {
      name: 'contentType',
      key: 'contentType',
      icon: 'file',
      isSearchable: true,
      order: 40,
      preference: 'filter-content-type'
    }
  },
  {
    type: 'FilterDateRange',
    options: {
      name: 'creationDate',
      key: 'metadata.tika_metadata_dcterms_created',
      icon: 'calendar-blank',
      order: 50
    }
  },
  {
    type: 'FilterLanguage',
    options: {
      name: 'language',
      key: 'language',
      icon: 'globe',
      order: 60,
      preference: 'filter-language'
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityPerson',
      key: 'byMentions',
      icon: 'user-square',
      color: 'var(--bs-category-person)',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityPerson,
      order: 70,
      preference: 'filter-named-entity-person'
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityOrganization',
      key: 'byMentions',
      icon: 'buildings',
      color: 'var(--bs-category-organization)',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityOrganization,
      order: 80,
      preference: 'filter-named-entity-organization'
    }
  },
  {
    type: 'FilterNamedEntity',
    options: {
      name: 'namedEntityLocation',
      key: 'byMentions',
      icon: 'map-pin',
      color: 'var(--bs-category-location)',
      isSearchable: true,
      category: namedEntityCategoryTranslation.namedEntityLocation,
      order: 90,
      preference: 'filter-named-entity-location'
    }
  },
  {
    type: 'FilterExtractionLevel',
    options: {
      name: 'extractionLevel',
      key: 'extractionLevel',
      icon: 'paperclip',
      order: 110,
      preference: 'filter-extraction-level'
    }
  },
  {
    type: 'FilterDate',
    options: {
      name: 'indexingDate',
      key: 'extractionDate',
      icon: 'calendar-blank',
      order: 120
    }
  }
]
