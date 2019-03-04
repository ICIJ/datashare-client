<template>
  <div class="app__footer text-nowrap">
    <router-link :to="{ name: 'indexing' }"  class="app__footer__addon btn btn-sm text-secondary" :title="$t('menu.analyse')" v-b-tooltip>
      <font-awesome-icon icon="rocket" />
      <span class="sr-only">{{ $t('menu.analyse') }}</span>
    </router-link>
    <div class="app__footer__addon app__footer__addon--homedir" :title="$t('footer.homedir')" v-b-tooltip v-if="!isRemote">
      <font-awesome-icon icon="folder" class="mr-1" />
      {{ config.mountedDataDir || config.dataDir }}
    </div>
    <div class="w-100">
      <b-tooltip :target="() => this.$refs.appFooterVersion">
        <div class="app__footer__tooltip">
          <div class="d-flex text-left align-items-center app__footer__tooltip__client">
            <div class="text-muted w-100">
              <font-awesome-icon icon="desktop" />
              {{ $t('footer.clientVersion') }}
            </div>
            <div class="m-1 text-monospace app__footer__tooltip__client__value">
              {{ clientHash }}
            </div>
          </div>
          <div class="d-flex text-left align-items-center app__footer__tooltip__server">
            <div class="text-muted w-100">
              <font-awesome-icon icon="server" />
              {{ $t('footer.serverVersion') }}
            </div>
            <div class="m-1 text-monospace app__footer__tooltip__server__value">
              {{ serverHash }}
            </div>
          </div>
        </div>
      </b-tooltip>
    </div>

    <div class="app__footer__addon app__footer__addon--version" ref="appFooterVersion">
      <font-awesome-icon icon="bolt" class="mr-1" />
      {{ serverVersion }}
    </div>
    <div class="app__footer__addon app__footer__addon--lang">
      <b-dropdown variant="link" size="sm" no-caret>
        <template slot="button-content">
          <font-awesome-icon icon="globe" class="mr-1" />
          {{ currentLanguage.label }}
        </template>
        <b-dropdown-item v-for="lang in languages" :key="lang.key" @click.prevent="changeLanguage(lang.key)" :active="lang === currentLanguage">
          {{ lang.label }}
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
import utils from '@/mixins/utils'
import DatashareClient from '@/api/DatashareClient'
import find from 'lodash/find'

export default {
  name: 'AppFooter',
  mixins: [utils],
  created () {
    const ds = new DatashareClient()
    this.promise = ds.getVersion().then(r => r.json())
    this.getServerVersion()
  },
  data () {
    return {
      serverHash: '',
      serverVersion: '',
      promise: null,
      languages: [{
        key: 'en',
        label: 'English'
      }, {
        key: 'fr',
        label: 'Français'
      }, {
        key: 'es',
        label: 'Español'
      }],
      loadedLanguages: ['en']
    }
  },
  computed: {
    clientHash () {
      return process.env.VUE_APP_GIT_HASH.substring(0, 7)
    },
    currentLanguage () {
      const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.$i18n.locale
      this.loadLanguageAsync(lang)
      return find(this.languages, { key: lang })
    }
  },
  methods: {
    getServerVersion () {
      return this.promise.then(res => {
        this.serverHash = res['git.commit.id.abbrev']
        this.serverVersion = res['git.build.version']
      })
    },
    changeLanguage (lang) {
      this.loadLanguageAsync(lang)
    },
    setI18nLanguage (lang) {
      localStorage.setItem('lang', lang)
      this.$i18n.locale = lang
      return lang
    },
    loadLanguageAsync (lang) {
      if (this.$i18n.locale !== lang) {
        if (!this.loadedLanguages.includes(lang)) {
          return import(/* webpackChunkName: "[request]" */ '@/lang/' + lang + '.json').then(messages => {
            this.$i18n.setLocaleMessage(lang, messages.default)
            this.loadedLanguages.push(lang)
            return this.setI18nLanguage(lang)
          })
        }
        return Promise.resolve(this.setI18nLanguage(lang))
      }
      return Promise.resolve(lang)
    }
  }
}
</script>

<style lang="scss">
  .app__footer {
    z-index: $zindex-fixed;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: $app-footer-height;
    color: white;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    background: #222;

    &__addon {
      padding: 0 .5em;
      height: $app-footer-height;
      display: flex;
      align-items: center;

      &--homedir {
        border-left: 1px solid  rgba(white, .1);
        font-family: $font-family-monospace;
      }

      &--version {
        font-weight: bold;
      }

      &--lang {
        .btn, .btn:hover, .btn:focus {
          border: none;
          color: white;
          text-decoration: none;
        }

        .dropdown-menu {
          top: -0.5 * $spacer  !important;
        }
      }
    }
  }
</style>
