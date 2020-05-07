import xss from 'xss'
import IdentityPipeline from './IdentityPipeline'

class SanitizeHtml extends IdentityPipeline {
  apply (content) {
    const whiteList = { mark: ['style', 'class', 'title'], p: true }
    return xss(content, { stripIgnoreTag: true, whiteList })
  }
}

export default SanitizeHtml
