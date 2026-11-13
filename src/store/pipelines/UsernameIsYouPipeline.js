import IdentityPipeline from './IdentityPipeline'

class UsernameIsYouPipeline extends IdentityPipeline {
  async apply(username, auth) {
    if (await this.isYou(username, auth)) {
      return window?.datashare?.i18n.global.t('global.you', { username })
    }
    return username
  }

  async isYou(username, auth) {
    try {
      return username === (await auth.getUsername())
    }
    // Without an answer from the server, show the username as is.
    catch {
      return false
    }
  }
}

export default UsernameIsYouPipeline
