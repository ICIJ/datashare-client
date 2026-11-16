import { Core } from '@/core'

describe('I18nMixin', () => {
  let core

  afterAll(async () => {
    localStorage.removeItem('locale')
  })

  describe('without language in local storage', () => {
    beforeEach(async () => {
      localStorage.removeItem('locale')
      core = Core.init().useAll()
      await core.initializeI18n()
    })

    afterEach(async () => {
      await core.loadI18Locale('en')
    })

    it('should use "en" as default language', () => {
      expect(core.i18n.global.locale.value).toBe('en')
      expect(core.i18n.global.fallbackLocale.value).toBe('en')
    })

    it('should have "en" messages', () => {
      expect(core.hasI18Locale('en')).toBeTruthy()
    })

    it('should save the "en" local in local storage by default', async () => {
      expect(localStorage.getItem('locale')).toBe('en')
    })

    it('should not have "fr" messages', () => {
      expect(core.hasI18Locale('fr')).toBeFalsy()
    })

    it('should switch to Spanish (es)', async () => {
      await core.loadI18Locale('es')
      expect(core.i18n.global.locale.value).toBe('es')
    })

    it('should have "es" message', async () => {
      await core.loadI18Locale('es')
      expect(core.hasI18Locale('es')).toBeTruthy()
    })

    it('should save the "es" local in local storage', async () => {
      await core.loadI18Locale('es')
      expect(localStorage.getItem('locale')).toBe('es')
    })
  })

  describe('with a regional language in local storage', () => {
    it('should use "fr" for "fr-FR"', async () => {
      localStorage.setItem('locale', 'fr-FR')
      core = Core.init().useAll()
      await core.initializeI18n()
      expect(core.i18n.global.locale.value).toBe('fr')
    })

    it('should use "fr" for "fr_CA"', async () => {
      localStorage.setItem('locale', 'fr_CA')
      core = Core.init().useAll()
      await core.initializeI18n()
      expect(core.i18n.global.locale.value).toBe('fr')
    })
  })

  describe('with an unknown language in local storage', () => {
    beforeEach(async () => {
      localStorage.setItem('locale', 'xx-XX')
      core = Core.init().useAll()
      await core.initializeI18n()
    })

    it('should fall back to "en"', () => {
      expect(core.i18n.global.locale.value).toBe('en')
    })

    it('should save "en" in local storage', () => {
      expect(localStorage.getItem('locale')).toBe('en')
    })
  })

  describe('with german language in local storage', () => {
    beforeEach(async () => {
      localStorage.setItem('locale', 'de')
      core = Core.init().useAll()
      await core.initializeI18n()
    })

    afterEach(async () => {
      await core.loadI18Locale('de')
    })

    it('should use "de" as default language', () => {
      expect(core.i18n.global.locale.value).toBe('de')
    })

    it('should have "de" messages', () => {
      expect(core.hasI18Locale('de')).toBeTruthy()
    })

    it('should switch to Japanese (ja)', async () => {
      await core.loadI18Locale('ja')
      expect(core.i18n.global.locale.value).toBe('ja')
    })

    it('should have "ja" messages', async () => {
      await core.loadI18Locale('ja')
      expect(core.hasI18Locale('ja')).toBeTruthy()
    })

    it('should save the "ja" local in local storage', async () => {
      await core.loadI18Locale('ja')
      expect(localStorage.getItem('locale')).toBe('ja')
    })
  })
})
