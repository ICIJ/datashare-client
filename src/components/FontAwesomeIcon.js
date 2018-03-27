import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import fontawesome from '@fortawesome/fontawesome'

// Pick icons
import faBars from '@fortawesome/fontawesome-free-solid/faBars'
import faExternalLinkAlt from '@fortawesome/fontawesome-free-solid/faExternalLinkAlt'
import faGlobe from '@fortawesome/fontawesome-free-solid/faGlobe'
import faFileAlt from '@fortawesome/fontawesome-free-solid/faFileAlt'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'
import faEyeSlash from '@fortawesome/fontawesome-free-solid/faEyeSlash'
import faCaretDown from '@fortawesome/fontawesome-free-solid/faCaretDown'
import faCaretRight from '@fortawesome/fontawesome-free-solid/faCaretRight'
// And add them to the library
fontawesome.library.add(
  faBars,
  faExternalLinkAlt,
  faGlobe,
  faFileAlt,
  faSearch,
  faEyeSlash,
  faCaretDown,
  faCaretRight
)

export default FontAwesomeIcon
