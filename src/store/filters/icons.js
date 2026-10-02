import { markRaw } from 'vue'

import IPhCirclesThreePlus from '~icons/ph/circles-three-plus'
import IPhStar from '~icons/ph/star'
import IPhHash from '~icons/ph/hash'
import IPhUsers from '~icons/ph/users'
import IPhTreeStructure from '~icons/ph/tree-structure'
import IPhFile from '~icons/ph/file'
import IPhFiles from '~icons/ph/files'
import IPhCalendarBlank from '~icons/ph/calendar-blank'
import IPhGlobe from '~icons/ph/globe'
import IPhUserSquare from '~icons/ph/user-square'
import IPhBuildings from '~icons/ph/buildings'
import IPhMapPin from '~icons/ph/map-pin'
import IPhEnvelope from '~icons/ph/envelope'
import IPhPaperclip from '~icons/ph/paperclip'
import IPhCalendarPlus from '~icons/ph/calendar-plus'

import { CONTENT_TYPE_CATEGORY_FILTER_NAME } from '@/store/filters/FilterContentTypeCategory'

// Icons for the built-in filters, keyed by filter `name`. Kept out of
// `store/filters/index.js` so they don't ship in the eager core chunk.
// Object.create(null): consumers index this map with user-typed field
// names (e.g. SearchParameterFilter.vue), and a plain {} would resolve
// prototype keys like `toString`/`constructor` instead of undefined.
export default Object.assign(Object.create(null), {
  project: markRaw(IPhCirclesThreePlus),
  starred: markRaw(IPhStar),
  tags: markRaw(IPhHash),
  recommendedBy: markRaw(IPhUsers),
  path: markRaw(IPhTreeStructure),
  contentType: markRaw(IPhFile),
  [CONTENT_TYPE_CATEGORY_FILTER_NAME]: markRaw(IPhFiles),
  creationDate: markRaw(IPhCalendarBlank),
  language: markRaw(IPhGlobe),
  namedEntityPerson: markRaw(IPhUserSquare),
  namedEntityOrganization: markRaw(IPhBuildings),
  namedEntityLocation: markRaw(IPhMapPin),
  namedEntityEmail: markRaw(IPhEnvelope),
  extractionLevel: markRaw(IPhPaperclip),
  indexingDate: markRaw(IPhCalendarPlus)
})
