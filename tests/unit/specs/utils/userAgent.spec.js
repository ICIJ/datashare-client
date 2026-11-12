import { parseUserAgent } from '@/utils/userAgent'

const FIREFOX_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:158.0) Gecko/20100101 Firefox/158.0'
const CHROME_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
const EDGE_WINDOWS = `${CHROME_WINDOWS} Edg/142.0.3595.53`
const OPERA_LINUX = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0'
const SAFARI_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'
const CHROME_ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36'

describe('parseUserAgent', () => {
  it.each([
    [FIREFOX_MAC, 'Firefox 158.0', 'macOS'],
    [CHROME_WINDOWS, 'Chrome 142.0.0.0', 'Windows'],
    [EDGE_WINDOWS, 'Edge 142.0.3595.53', 'Windows'],
    [OPERA_LINUX, 'Opera 125.0.0.0', 'Linux'],
    [SAFARI_IPHONE, 'Safari 18.6', 'iOS'],
    [CHROME_ANDROID, 'Chrome 142.0.0.0', 'Android']
  ])('reads the browser and OS of %s', (ua, browser, os) => {
    expect(parseUserAgent(ua)).toEqual({ browser, os })
  })

  it('returns nulls for an unknown user agent', () => {
    expect(parseUserAgent('curl/8.5.0')).toEqual({ browser: null, os: null })
  })
})
