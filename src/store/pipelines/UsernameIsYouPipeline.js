import Auth from '@/api/resources/Auth'
import IdentityPipeline from './IdentityPipeline'
import server from '@/modes'

export const auth = new Auth(server())

class UsernameIsYouPipeline extends IdentityPipeline {
  async apply (username) {
    if (await this.isYou(username)) {
      return window?.datashare?.i18n.t('global.you') || 'You'
    }
    return username
  }
  async isYou (username) {
    return username === await auth.getUsername()
  }
}

export default UsernameIsYouPipeline
