import { getOS, getShortkeyOS, getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'

describe('utils', () => {
  let languageGetter

  beforeEach(() => {
    languageGetter = jest.spyOn(window.navigator, 'platform', 'get')
  })

  describe('getOS', () => {
    it('should retrieve Mac OS', () => {
      languageGetter.mockReturnValue('MacIntel')
      expect(getOS()).toBe('mac')
    })

    it('should retrieve Windows OS', () => {
      languageGetter.mockReturnValue('Win32')
      expect(getOS()).toBe('windows')
    })

    it('should retrieve Linux OS', () => {
      languageGetter.mockReturnValue('Linux x86_64')
      expect(getOS()).toBe('linux')
    })

    it('should retrieve no OS', () => {
      languageGetter.mockReturnValue('FreeBSD i386')
      expect(getOS()).toBe('other')
    })
  })

  describe('getShortkeyOS', () => {
    it('should return "mac" if mac OS', () => {
      languageGetter.mockReturnValue('MacIntel')
      expect(getShortkeyOS()).toBe('mac')
    })

    it('should return "default" if other than mac OS', () => {
      languageGetter.mockReturnValue('Other OS')
      expect(getShortkeyOS()).toBe('default')
    })
  })

  describe('getDocumentTypeLabel', () => {
    it('should retrieve the document type for PDF', () => {
      expect(getDocumentTypeLabel('application/pdf')).toBe('Portable Document Format (PDF)')
    })

    it('should retrieve the document type if no type (1/2)', () => {
      expect(getDocumentTypeLabel('')).toBe('')
    })

    it('should retrieve the document type if no type (2/2)', () => {
      expect(getDocumentTypeLabel()).toBe('')
    })

    it('should retrieve the document type for unknown type', () => {
      expect(getDocumentTypeLabel('Unknown')).toBe('Unknown')
    })
  })

  describe('getExtractionLevelTranslationKey', () => {
    it('should retrieve the correct extraction level translation key', () => {
      expect(getExtractionLevelTranslationKey(5)).toBe('filter.level.level05')
    })

    it('should retrieve the extraction level if no level (1/2)', () => {
      expect(getExtractionLevelTranslationKey('')).toBe('filter.level.')
    })

    it('should retrieve the extraction level if no level (1/2)', () => {
      expect(getExtractionLevelTranslationKey()).toBe('')
    })

    it('should retrieve the extraction level for unknown level', () => {
      expect(getExtractionLevelTranslationKey('Unknown')).toBe('filter.level.Unknown')
    })
  })
})
