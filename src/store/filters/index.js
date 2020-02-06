import { map, isInteger, toLower } from 'lodash'
import moment from 'moment'
import types from '@/utils/types.json'
import { getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'
import { namedEntityCategoryTranslation } from '@/store/filters/FilterNamedEntity'

export { default as FilterText } from './FilterText'
export { default as FilterYesNo } from './FilterYesNo'
export { default as FilterStarred } from './FilterStarred'
export { default as FilterDate } from './FilterDate'
export { default as FilterDateRange } from './FilterDateRange'
export { default as FilterPath } from './FilterPath'
export { default as FilterNamedEntity } from './FilterNamedEntity'

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
    type: 'FilterText',
    options: {
      name: 'contentType',
      key: 'contentType',
      icon: 'file',
      isSearchable: true,
      labelFun: item => getDocumentTypeLabel(item.key),
      alternativeSearch: query => map(types, (item, key) => { if (toLower(item.label).includes(query)) return key })
    }
  },
  {
    type: 'FilterDateRange',
    options: {
      name: 'creationDate',
      key: 'metadata.tika_metadata_creation_date',
      icon: 'calendar-alt',
      labelFun: item => isInteger(item.key) ? moment(item.key).locale(localStorage.getItem('locale')).format('L') : item.key
    }
  },
  {
    type: 'FilterText',
    options: {
      name: 'language',
      key: 'language',
      icon: 'language',
      labelFun: item => `filter.lang.${item.key}`
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
    type: 'FilterText',
    options: {
      name: 'extractionLevel',
      key: 'extractionLevel',
      icon: 'paperclip',
      labelFun: item => getExtractionLevelTranslationKey(item.key)
    }
  },
  {
    type: 'FilterDate',
    options: {
      name: 'indexingDate',
      key: 'extractionDate',
      icon: 'calendar-plus',
      labelFun: item => item.key_as_string
    }
  }
]
