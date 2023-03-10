import xss from 'xss'

import IdentityPipeline from './IdentityPipeline'

class SanitizeHtml extends IdentityPipeline {
  apply(content) {
    function process(whiteList) {
      return xss(content, { stripIgnoreTag: true, whiteList })
    }

    try {
      const whiteList = { mark: ['style', 'class', 'title', 'data-offset'], p: true }
      return process(whiteList)
    } catch (_) {
      const whiteList = { mark: ['style', 'class', 'title', 'data-offset'] }
      return process(whiteList)
    }
  }
}

export default SanitizeHtml
