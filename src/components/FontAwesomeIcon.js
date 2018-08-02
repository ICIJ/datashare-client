import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { library, dom } from '@fortawesome/fontawesome-svg-core'

import {faUserShield} from '@fortawesome/free-solid-svg-icons/faUserShield'
import {faBars} from '@fortawesome/free-solid-svg-icons/faBars'
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
import {faGlobe} from '@fortawesome/free-solid-svg-icons/faGlobe'
import {faFolder} from '@fortawesome/free-solid-svg-icons/faFolder'
import {faFolderOpen} from '@fortawesome/free-solid-svg-icons/faFolderOpen'
import {faFile} from '@fortawesome/free-solid-svg-icons/faFile'
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch'
import {faEyeSlash} from '@fortawesome/free-solid-svg-icons/faEyeSlash'
import {faCaretDown} from '@fortawesome/free-solid-svg-icons/faCaretDown'
import {faCaretRight} from '@fortawesome/free-solid-svg-icons/faCaretRight'
import {faAngleDoubleLeft} from '@fortawesome/free-solid-svg-icons/faAngleDoubleLeft'
import {faAngleLeft} from '@fortawesome/free-solid-svg-icons/faAngleLeft'
import {faAngleRight} from '@fortawesome/free-solid-svg-icons/faAngleRight'
import {faAngleDoubleRight} from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight'
import {faAngleDown} from '@fortawesome/free-solid-svg-icons/faAngleDown'
import {faAngleUp} from '@fortawesome/free-solid-svg-icons/faAngleUp'
import {faAmbulance} from '@fortawesome/free-solid-svg-icons/faAmbulance'
import {faUndo} from '@fortawesome/free-solid-svg-icons/faUndo'
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus'
import {faRedo} from '@fortawesome/free-solid-svg-icons/faRedo'
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket'

library.add(
  faUserShield,
  faBars,
  faCog,
  faExternalLinkAlt,
  faGlobe,
  faFolder,
  faFolderOpen,
  faFile,
  faSearch,
  faEyeSlash,
  faCaretDown,
  faCaretRight,
  faAngleDoubleLeft,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleRight,
  faAngleDown,
  faAngleUp,
  faAmbulance,
  faUndo,
  faPlus,
  faRedo,
  faRocket
)

// Kicks off the process of finding <i> tags and replacing with <svg>
dom.watch()

export default FontAwesomeIcon
