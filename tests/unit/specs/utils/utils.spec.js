import { getOS, isAuthenticated, getDocumentType } from '@/utils/utils'
import { setCookie } from 'tiny-cookie'

describe('utils', () => {
  let languageGetter

  beforeEach(() => {
    languageGetter = jest.spyOn(window.navigator, 'platform', 'get')
  })

  it('retrieves Mac OS', () => {
    languageGetter.mockReturnValue('MacIntel')
    expect(getOS()).toEqual('mac')
  })

  it('retrieves Windows OS', () => {
    languageGetter.mockReturnValue('Win32')
    expect(getOS()).toEqual('windows')
  })

  it('retrieves Linux OS', () => {
    languageGetter.mockReturnValue('Linux x86_64')
    expect(getOS()).toEqual('linux')
  })

  it('retrieves no OS', () => {
    languageGetter.mockReturnValue('FreeBSD i386')
    expect(getOS()).toEqual('other')
  })

  it('should not be authenticated in test mode', () => {
    expect(isAuthenticated()).toBeFalsy()
  })

  it('should not be authenticated if the cookie has no login field', () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'doe', JSON.stringify)
    expect(isAuthenticated()).toBeFalsy()
  })

  it('should be authenticated if there is a cookie with a login field', () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'doe' }, JSON.stringify)
    expect(isAuthenticated()).toBeTruthy()
  })

  it('retrieves the document type for PDF', () => {
    expect(getDocumentType('application/pdf')).toEqual('Portable Document Format (PDF)')
  })

  it('retrieves the document type if no type (1/2)', () => {
    expect(getDocumentType('')).toEqual('')
  })

  it('retrieves the document type if no type (2/2)', () => {
    expect(getDocumentType()).toEqual('')
  })

  it('retrieves the document type for unknown type', () => {
    expect(getDocumentType('Unknown')).toEqual('Unknown')
  })
})
