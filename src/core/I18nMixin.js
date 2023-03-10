import { isEmpty } from 'lodash'

import settings from '@/utils/settings'

/**
  Mixin class extending the core to add helpers for i18n.
  @mixin I18nMixin
  @typicalname datashare
*/
const I18nMixin = (superclass) =>
  class extends superclass {
    /**
     * Initialize i18N using the local storage and load
     * the necessary locale's messages
     * @memberof I18nMixin.prototype
     * @returns {Promise}
     */
    initializeI18n() {
      const locale = localStorage.getItem('locale') ?? this.i18n.locale
      return this.loadI18Locale(locale)
    }

    /**
     * Set the active locale both in local stoage and VueI18n.
     * @memberof I18nMixin.prototype
     * @param {String} locale - Key of the local (fr, de, en, ja, ...)
     * @returns {String}
     */
    setI18nLocale(locale = settings.defaultLocale) {
      localStorage.setItem('locale', locale)
      this.i18n.locale = locale
      return locale
    }

    /**
     * Check the given locale storage was loaded.
     * @memberof I18nMixin.prototype
     * @param {String} locale - Key of the local (fr, de, en, ja, ...)
     * @returns {Boolean}
     */
    hasI18Locale(locale) {
      return !isEmpty(this.i18n.getLocaleMessage(locale))
    }

    /**
     * Load i18n messages for the given locale (if needed)
     * and set it as the current locale.
     * @memberof I18nMixin.prototype
     * @param {String} locale - Key of the local (fr, de, en, ja, ...)
     * @returns {Promise}
     */
    async loadI18Locale(locale) {
      if (!this.hasI18Locale(locale)) {
        const messages = await import(/* webpackChunkName: "[request]" */ '@/lang/' + locale + '.json')
        this.i18n.setLocaleMessage(locale, messages.default)
        return this.setI18nLocale(locale)
      }
      return this.setI18nLocale(locale)
    }
  }

export default I18nMixin
