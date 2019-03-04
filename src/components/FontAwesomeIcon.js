import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { library, dom } from '@fortawesome/fontawesome-svg-core'

import { faAmbulance } from '@fortawesome/free-solid-svg-icons/faAmbulance'
import { faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons/faAngleDoubleLeft'
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons/faAngleLeft'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight'
import { faAngleUp } from '@fortawesome/free-solid-svg-icons/faAngleUp'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import { faBolt } from '@fortawesome/free-solid-svg-icons/faBolt'
import { faBuilding } from '@fortawesome/free-solid-svg-icons/faBuilding'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { faDesktop } from '@fortawesome/free-solid-svg-icons/faDesktop'
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
import { faFile } from '@fortawesome/free-solid-svg-icons/faFile'
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter'
import { faFolder } from '@fortawesome/free-solid-svg-icons/faFolder'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen'
import { faGlobe } from '@fortawesome/free-solid-svg-icons/faGlobe'
import { faIdBadge } from '@fortawesome/free-solid-svg-icons/faIdBadge'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons/faMapMarkerAlt'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons/faQuestionCircle'
import { faRedo } from '@fortawesome/free-solid-svg-icons/faRedo'
import { faRocket } from '@fortawesome/free-solid-svg-icons/faRocket'
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch'
import { faServer } from '@fortawesome/free-solid-svg-icons/faServer'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt'
import { faUndo } from '@fortawesome/free-solid-svg-icons/faUndo'
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield'

library.add(
  faAmbulance,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faAngleUp,
  faBars,
  faBan,
  faBolt,
  faBuilding,
  faCaretDown,
  faCaretRight,
  faCog,
  faDesktop,
  faDownload,
  faEllipsisV,
  faExclamationTriangle,
  faExternalLinkAlt,
  faEyeSlash,
  faFile,
  faFilter,
  faFolder,
  faFolderOpen,
  faGlobe,
  faIdBadge,
  faMapMarkerAlt,
  faPlus,
  faQuestionCircle,
  faRedo,
  faRocket,
  faServer,
  faSearch,
  faSignOutAlt,
  faTimesCircle,
  faTrashAlt,
  faUndo,
  faUserShield
)

// Kicks off the process of finding <i> tags and replacing with <svg>
dom.watch()

export default FontAwesomeIcon
