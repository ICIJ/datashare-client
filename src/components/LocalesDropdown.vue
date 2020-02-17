<template>
  <b-button class="locales-dropdown" :id="uniqueId" href="#" variant="none">
    <span class="locales-dropdown__button">
      <slot v-bind="{ currentLocale, locales }">
        <fa icon="globe" class="mr-1" />
        {{ currentLocale.label }}
      </slot>
    </span>
    <b-popover :target="uniqueId" triggers="click blur" custom-class="locales-dropdown__menu" ref="popover">
      <div class="dropdown-menu show position-static border-0 px-2 bg-none">
        <a href="#" class="dropdown-item" v-for="locale in locales" :key="locale.key" @click.prevent="chooseLocale(locale.key)" :class="{ active: locale === currentLocale }">
          {{ locale.label }}
        </a>
      </div>
    </b-popover>
  </b-button>
</template>

<script>
import uniqueId from 'lodash/uniqueId'
import find from 'lodash/find'
import settings from '@/utils/settings'

export default {
  name: 'LocalesDropdown',
  props: {
    size: {
      type: String
    },
    noCaret: {
      type: Boolean
    },
    toggleClass: {
      type: String
    }
  },
  data () {
    return {
      locales: settings.locales,
      loadedLocales: [settings.defaultLocale]
    }
  },
  computed: {
    currentLocale () {
      const key = localStorage.getItem('locale') ? localStorage.getItem('locale') : this.$i18n.locale
      this.loadLocale(key)
      return find(this.locales, { key })
    },
    uniqueId () {
      return uniqueId('locales-dropdown')
    }
  },
  methods: {
    chooseLocale (locale) {
      this.loadLocale(locale)
      if (this.$refs.popover) {
        this.$refs.popover.$emit('close')
      }
    },
    setI18nLanguage (locale) {
      localStorage.setItem('locale', locale)
      this.$i18n.locale = locale
      return locale
    },
    loadLocale (locale) {
      if (this.$i18n.locale !== locale) {
        if (!this.loadedLocales.includes(locale)) {
          return import(/* webpackChunkName: "[request]" */ '@/lang/' + locale + '.json').then(messages => {
            this.$i18n.setLocaleMessage(locale, messages.default)
            this.loadedLocales.push(locale)
            return this.setI18nLanguage(locale)
          })
        }
        return Promise.resolve(this.setI18nLanguage(locale))
      }
      return Promise.resolve(locale)
    }
  }
}
</script>

<style lang="scss" scoped>
  .locales-dropdown {

    &__menu {

      .popover-body {
        padding: 0;

        .dropdown-menu {
          background: inherit;
          color: inherit;

          .dropdown-item:not(.active) {
            color: inherit;
            background: transparent;
          }
        }
      }

    }
  }
</style>
