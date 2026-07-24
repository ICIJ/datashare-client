import axios, { AxiosHeaders } from 'axios'

import settings from '@/utils/settings'

// Importing the module applies the CSRF defaults as a side effect
import '@/api/apiInstance'
import { withJsonCharset } from '@/api/apiInstance'

describe('apiInstance', () => {
  describe('csrf', () => {
    it('should configure axios xsrfCookieName from settings', () => {
      expect(axios.defaults.xsrfCookieName).toBe(settings.csrf.cookieName)
    })

    it('should configure axios xsrfHeaderName from settings', () => {
      expect(axios.defaults.xsrfHeaderName).toBe(settings.csrf.headerName)
    })
  })

  describe('withJsonCharset request interceptor', () => {
    it('adds the utf-8 charset for plain object JSON bodies', () => {
      const config = withJsonCharset({ data: { foo: 'bar' }, headers: new AxiosHeaders() })
      expect(config.headers.getContentType()).toBe('application/json; charset=utf-8')
    })

    it('adds the utf-8 charset for array JSON bodies', () => {
      const config = withJsonCharset({ data: [1, 2, 3], headers: new AxiosHeaders() })
      expect(config.headers.getContentType()).toBe('application/json; charset=utf-8')
    })

    it('leaves FormData uploads untouched so the multipart boundary is preserved', () => {
      const data = new FormData()
      data.append('field', 'value')
      const config = withJsonCharset({ data, headers: new AxiosHeaders() })
      expect(config.headers.getContentType()).toBeFalsy()
    })

    it('does not override an explicit Content-Type', () => {
      const headers = new AxiosHeaders({ 'Content-Type': 'text/plain;charset=UTF-8' })
      const config = withJsonCharset({ data: { foo: 'bar' }, headers })
      expect(config.headers.getContentType()).toBe('text/plain;charset=UTF-8')
    })

    it('leaves bodyless requests (e.g. GET) untouched', () => {
      const config = withJsonCharset({ headers: new AxiosHeaders() })
      expect(config.headers.getContentType()).toBeFalsy()
    })
  })
})
