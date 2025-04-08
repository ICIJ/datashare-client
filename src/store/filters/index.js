import { MODE_NAME } from '@/mode/index'
import { namedEntityCategoryTranslation } from '@/store/filters/FilterEntity'

export { default as FilterContentType } from './FilterContentType'
export { default as FilterDate } from './FilterDate'
export { default as FilterDateRange } from './FilterDateRange'
export { default as FilterExtractionLevel } from './FilterExtractionLevel'
export { default as FilterLanguage } from './FilterLanguage'
export { default as FilterEntity } from './FilterEntity'
export { default as FilterProject } from './FilterProject'
export { default as FilterPath } from './FilterPath'
export { default as FilterRecommendedBy } from './FilterRecommendedBy'
export { default as FilterStarred } from './FilterStarred'
export { default as FilterTag } from './FilterTag'
export { default as FilterText } from './FilterText'

export default [
  {
    type: 'FilterProject',
    options: {
      name: 'project',
      key: '_index',
      icon: 'circles-three-plus',
      order: 0,
      section: 'documentsInfo',
      preference: 'filter-project',
      hideAll: true,
      hideSearch: true,
      hideSort: true,
      hideContextualize: false,
      hideExclude: true,
      hideExpand: true,
      fromElasticSearch: true
    }
  },
  {
    type: 'FilterStarred',
    options: {
      name: 'starred',
      key: '_id',
      icon: 'star',
      order: 10,
      section: 'userData',
      preference: 'filter-starred',
      hideSearch: true,
      hideSort: true,
      hideContextualize: true,
      hideExclude: true,
      hideExpand: true,
      fromElasticSearch: false
    }
  },
  {
    type: 'FilterTag',
    options: {
      name: 'tags',
      key: 'tags',
      icon: 'hash',
      order: 20,
      section: 'userData',
      preference: 'filter-tags'
    }
  },
  {
    type: 'FilterRecommendedBy',
    options: {
      name: 'recommendedBy',
      key: '_id',
      icon: 'users',
      modes: [MODE_NAME.SERVER],
      order: 30,
      section: 'userData',
      hideSearch: true,
      hideSort: true,
      hideContextualize: true,
      hideExclude: true,
      hideExpand: true,
      fromElasticSearch: true
    }
  },
  {
    type: 'FilterPath',
    options: {
      name: 'path',
      key: 'byDirname',
      icon: 'tree-structure',
      order: 35,
      section: 'documentsInfo',
      hideAll: true,
      hideSearch: true,
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
      order: 40,
      section: 'documentsInfo',
      preference: 'filter-content-type'
    }
  },
  {
    type: 'FilterDateRange',
    options: {
      name: 'creationDate',
      key: 'metadata.tika_metadata_dcterms_created',
      icon: 'calendar-blank',
      order: 50,
      hideAll: true,
      hideSearch: true,
      hideSort: true,
      hideContextualize: true,
      hideExclude: false,
      hideExpand: true,
      section: 'documentsInfo'
    }
  },
  {
    type: 'FilterLanguage',
    options: {
      name: 'language',
      key: 'language',
      icon: 'globe',
      order: 60,
      section: 'documentsInfo',
      preference: 'filter-language'
    }
  },
  {
    type: 'FilterEntity',
    options: {
      name: 'namedEntityPerson',
      key: 'byMentions',
      icon: 'user-square',
      category: namedEntityCategoryTranslation.namedEntityPerson,
      order: 70,
      section: 'entities',
      preference: 'filter-named-entity-person'
    }
  },
  {
    type: 'FilterEntity',
    options: {
      name: 'namedEntityOrganization',
      key: 'byMentions',
      icon: 'buildings',
      category: namedEntityCategoryTranslation.namedEntityOrganization,
      order: 80,
      section: 'entities',
      preference: 'filter-named-entity-organization'
    }
  },
  {
    type: 'FilterEntity',
    options: {
      name: 'namedEntityLocation',
      key: 'byMentions',
      icon: 'map-pin',
      category: namedEntityCategoryTranslation.namedEntityLocation,
      order: 90,
      section: 'entities',
      preference: 'filter-named-entity-location'
    }
  },
  {
    type: 'FilterEntity',
    options: {
      name: 'namedEntityEmail',
      key: 'byMentions',
      icon: 'envelope',
      category: namedEntityCategoryTranslation.namedEntityEmail,
      order: 100,
      section: 'entities',
      preference: 'filter-named-entity-email'
    }
  },
  {
    type: 'FilterExtractionLevel',
    options: {
      name: 'extractionLevel',
      key: 'extractionLevel',
      icon: 'paperclip',
      hideSearch: true,
      order: 110,
      section: 'documentsInfo',
      preference: 'filter-extraction-level'
    }
  },
  {
    type: 'FilterDate',
    options: {
      name: 'indexingDate',
      key: 'extractionDate',
      icon: 'calendar-plus',
      hideSearch: true,
      order: 120,
      section: 'documentsInfo'
    }
  }
]
