import axios from 'axios'

import settings from '@/utils/settings'

// Importing the module applies the CSRF defaults as a side effect
import '@/api/apiInstance'

describe('apiInstance', () => {
  describe('csrf', () => {
    it('should configure axios xsrfCookieName from settings', () => {
      expect(axios.defaults.xsrfCookieName).toBe(settings.csrf.cookieName)
    })

    it('should configure axios xsrfHeaderName from settings', () => {
      expect(axios.defaults.xsrfHeaderName).toBe(settings.csrf.headerName)
    })
  })
})
