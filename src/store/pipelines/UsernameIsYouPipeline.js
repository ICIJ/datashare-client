import IdentityPipeline from './IdentityPipeline'

class UsernameIsYouPipeline extends IdentityPipeline {
  async apply(username, auth) {
    if (await this.isYou(username, auth)) {
      return window?.datashare?.i18n.t('global.you') || 'You'
    }
    return username
  }
  async isYou(username, auth) {
    return username === (await auth.getUsername())
  }
}

export default UsernameIsYouPipeline
