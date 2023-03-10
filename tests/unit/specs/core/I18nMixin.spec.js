import { createLocalVue } from '@vue/test-utils'

import { Core } from '@/core'

describe('I18nMixin', () => {
  let core

  afterAll(async () => {
    localStorage.removeItem('locale')
  })

  describe('without language in local storage', () => {
    beforeEach(async () => {
      localStorage.removeItem('locale')
      core = Core.init(createLocalVue()).useAll()
      await core.initializeI18n()
    })

    afterEach(async () => {
      await core.loadI18Locale('en')
    })

    it('should use "en" as default language', () => {
      expect(core.i18n.locale).toBe('en')
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
      expect(core.i18n.locale).toBe('es')
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

  describe('with german language in local storage', () => {
    beforeEach(async () => {
      localStorage.setItem('locale', 'de')
      core = Core.init(createLocalVue()).useAll()
      await core.initializeI18n()
    })

    afterEach(async () => {
      await core.loadI18Locale('de')
    })

    it('should use "de" as default language', () => {
      expect(core.i18n.locale).toBe('de')
    })

    it('should have "de" messages', () => {
      expect(core.hasI18Locale('de')).toBeTruthy()
    })

    it('should switch to Japanese (ja)', async () => {
      await core.loadI18Locale('ja')
      expect(core.i18n.locale).toBe('ja')
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
