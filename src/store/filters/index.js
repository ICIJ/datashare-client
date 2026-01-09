import { markRaw } from 'vue'

import IPhCirclesThreePlus from '~icons/ph/circles-three-plus'
import IPhStar from '~icons/ph/star'
import IPhHash from '~icons/ph/hash'
import IPhUsers from '~icons/ph/users'
import IPhTreeStructure from '~icons/ph/tree-structure'
import IPhFile from '~icons/ph/file'
import IPhCalendarBlank from '~icons/ph/calendar-blank'
import IPhGlobe from '~icons/ph/globe'
import IPhUserSquare from '~icons/ph/user-square'
import IPhBuildings from '~icons/ph/buildings'
import IPhMapPin from '~icons/ph/map-pin'
import IPhEnvelope from '~icons/ph/envelope'
import IPhPaperclip from '~icons/ph/paperclip'
import IPhCalendarPlus from '~icons/ph/calendar-plus'

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
      icon: markRaw(IPhCirclesThreePlus),
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
      icon: markRaw(IPhStar),
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
      icon: markRaw(IPhHash),
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
      icon: markRaw(IPhUsers),
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
      icon: markRaw(IPhTreeStructure),
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
      icon: markRaw(IPhFile),
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
      icon: markRaw(IPhCalendarBlank),
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
      icon: markRaw(IPhGlobe),
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
      icon: markRaw(IPhUserSquare),
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
      icon: markRaw(IPhBuildings),
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
      icon: markRaw(IPhMapPin),
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
      icon: markRaw(IPhEnvelope),
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
      icon: markRaw(IPhPaperclip),
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
      icon: markRaw(IPhCalendarPlus),
      hideSearch: true,
      order: 120,
      section: 'documentsInfo'
    }
  }
]
