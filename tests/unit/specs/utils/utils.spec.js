import { getDocumentTypeLabel, getExtractionLevelTranslationKey, getOS, getShortkeyOS, objectIncludes } from '@/utils/utils'

describe('utils', () => {
  let languageGetter = null

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

  describe('objectIncludes', () => {
    it('should filter on a simple string, not case sensitive', () => {
      expect(objectIncludes('This is a Long and Complex string', 'compl')).toBeTruthy()
      expect(objectIncludes('This is a Long and simple string', 'compl')).toBeFalsy()
    })

    it('should filter on an array of strings', () => {
      expect(objectIncludes(['less and', 'array of', 'normal and complex', 'strings'], 'compl')).toBeTruthy()
      expect(objectIncludes(['less and', 'array of', 'normal and simple', 'strings'], 'compl')).toBeFalsy()
    })

    it('should filter on a simple object of strings', () => {
      expect(objectIncludes({ id: 'obj_01', name: 'this is an object', description: 'this is a complex description' }, 'compl')).toBeTruthy()
      expect(objectIncludes({ id: 'obj_02', name: 'this is an object', description: 'this is a simple description' }, 'compl')).toBeFalsy()
    })

    it('should filter on a complex object of strings', () => {
      expect(objectIncludes({
        id: 'obj_01',
        name: ['this has multiple', 'and some complex', 'names'],
        description: 'this is a description'
      }, 'compl')).toBeTruthy()
      expect(objectIncludes({
        id: 'obj_01',
        name: ['this has multiple', 'and some simple', 'names'],
        description: 'this is a description'
      }, 'compl')).toBeFalsy()
    })
  })
})
