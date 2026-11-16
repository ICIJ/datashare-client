import isEmpty from 'lodash/isEmpty'
import { i18n as murmurI18n } from '@icij/murmur'

import settings from '@/utils/settings'

const langLoaders = import.meta.glob('../lang/*.json', { import: 'default' })

// The stored locale can be regional (e.g. "en-US", set by another app sharing
// this origin's localStorage) but lang files only exist per language.
function toLanguage(locale) {
  const [language] = locale.split(/[-_]/)
  return language
}

function findLangLoader(language) {
  return langLoaders[`../lang/${language}.json`]
}

function resolveLanguage(locale) {
  const language = toLanguage(locale)
  if (findLangLoader(language)) {
    return language
  }
  return settings.defaultLocale
}

/**
  Mixin class extending the core to add helpers for i18n.
  @mixin I18nMixin
  @typicalname datashare
*/
const I18nMixin = superclass =>
  class extends superclass {
    /**
     * Initialize i18N using the local storage and load
     * the necessary locale's messages
     * @memberof I18nMixin.prototype
     * @returns {Promise}
     */
    initializeI18n() {
      const locale = localStorage.getItem('locale') ?? this.i18n.global.locale.value
      return this.loadI18Locale(locale)
    }

    /**
     * Set the active locale both in local storage and VueI18n.
     * @memberof I18nMixin.prototype
     * @param {String} locale - Key of the local (fr, de, en, ja, ...)
     * @returns {String}
     */
    setI18nLocale(locale = settings.defaultLocale) {
      localStorage.setItem('locale', locale)
      this.i18n.global.locale.value = locale
      return locale
    }

    /**
     * Check the given locale storage was loaded.
     * @memberof I18nMixin.prototype
     * @param {String} locale - Key of the local (fr, de, en, ja, ...)
     * @returns {Boolean}
     */
    hasI18Locale(locale) {
      return !isEmpty(this.i18n.global.getLocaleMessage(locale))
    }

    /**
     * Load i18n messages for the given locale (if needed)
     * and set it as the current locale.
     * @memberof I18nMixin.prototype
     * @param {String} locale - Key of the local (fr, de, en, ja, ...)
     * @returns {Promise}
     */
    async loadI18Locale(locale) {
      const language = resolveLanguage(locale)
      await this.loadI18AppMessages(language)
      this.mergeI18MurmurMessages(language)
      return this.setI18nLocale(language)
    }

    /**
     * Load the app messages for the given language (if needed).
     * @memberof I18nMixin.prototype
     * @param {String} language - Key of the language (fr, de, en, ja, ...)
     * @returns {Promise}
     */
    async loadI18AppMessages(language) {
      if (this.hasI18Locale(language)) {
        return
      }
      const loader = findLangLoader(language)
      const messages = await loader()
      this.i18n.global.setLocaleMessage(language, messages)
    }

    /**
     * Merge Murmur's messages for the given language into the app messages.
     * @memberof I18nMixin.prototype
     * @param {String} language - Key of the language (fr, de, en, ja, ...)
     */
    mergeI18MurmurMessages(language) {
      const murmurMessages = murmurI18n.global.getLocaleMessage(language)
      this.i18n.global.mergeLocaleMessage(language, murmurMessages)
    }
  }

export default I18nMixin
