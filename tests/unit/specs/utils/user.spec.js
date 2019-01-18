import getOS from '@/utils/user'

describe('user', () => {
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
})
