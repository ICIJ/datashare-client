<template>
  <div class="app__footer">
    <transition name="fade">
      <div v-show="showUserHistory" class="app__footer__user-history-backdrop" @click="toggleUserHistory"></div>
    </transition>
    <slide-up-down :active="showUserHistory" class="app__footer__user-history">
      <user-history />
    </slide-up-down>
    <div class="d-flex align-items-center text-nowrap">
      <b-button class="app__footer__addon app__footer__addon--delete-index btn btn-sm text-secondary"
              variant="link" @click="deleteAll" :title="$t('indexing.delete_index')" v-b-tooltip>
      <fa icon="trash-alt" />
    </b-button>
    <router-link :to="{ name: 'indexing' }"  class="app__footer__addon app__footer__addon--analyze-documents btn btn-sm text-secondary" :title="$t('menu.analyse')" v-b-tooltip v-if="!isRemote">
        <fa icon="rocket" />
        <span class="sr-only">{{ $t('menu.analyse') }}</span>
      </router-link>
      <div class="app__footer__addon app__footer__addon--homedir" :title="$t('footer.homedir')" v-b-tooltip v-if="!isRemote">
        <fa icon="folder" class="mr-1" />
        {{ $config.get('mountedDataDir') || $config.get('dataDir') }}
      </div>
      <div class="w-100">
        <b-tooltip :target="() => this.$refs.appFooterVersion">
          <div class="app__footer__tooltip">
            <div class="d-flex text-left align-items-center app__footer__tooltip__client">
              <div class="text-muted w-100">
                <fa icon="desktop" />
                {{ $t('footer.clientVersion') }}
              </div>
              <div class="m-1 text-monospace app__footer__tooltip__client__value">
                {{ clientHash }}
              </div>
            </div>
            <div class="d-flex text-left align-items-center app__footer__tooltip__server">
              <div class="text-muted w-100">
                <fa icon="server" />
                {{ $t('footer.serverVersion') }}
              </div>
              <div class="m-1 text-monospace app__footer__tooltip__server__value">
                {{ serverHash }}
              </div>
            </div>
          </div>
        </b-tooltip>
      </div>
      <div class="app__footer__addon app__footer__addon--history">
        <button  class="btn btn-sm btn-link text-white" @click="toggleUserHistory">
          <fa icon="clock" class="mr-1" />
          {{ $t('footer.userHistory') }}
        </button>
      </div>
      <div class="app__footer__addon app__footer__addon--version" ref="appFooterVersion">
        <fa icon="bolt" class="mr-1" />
        {{ serverVersion }}
      </div>
      <div class="app__footer__addon app__footer__addon--lang">
        <b-dropdown variant="link" size="sm" no-caret>
          <template slot="button-content">
            <fa icon="globe" class="mr-1" />
            {{ currentLanguage.label }}
          </template>
          <b-dropdown-item v-for="lang in languages" :key="lang.key" @click.prevent="changeLanguage(lang.key)" :active="lang === currentLanguage">
            {{ lang.label }}
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import utils from '@/mixins/utils'
import DatashareClient from '@/api/DatashareClient'
import { EventBus } from '@/utils/event-bus'
import UserHistory from '@/components/UserHistory'
import find from 'lodash/find'

export default {
  name: 'AppFooter',
  mixins: [utils],
  components: { UserHistory },
  created () {
    const ds = new DatashareClient()
    this.promise = ds.getVersion().then(r => r.json())
    this.getServerVersion()
  },
  mounted () {
    this.saveComponentHeight()
  },
  updated () {
    this.saveComponentHeight()
  },
  data () {
    return {
      serverHash: '',
      serverVersion: '',
      promise: null,
      showUserHistory: false,
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
  watch: {
    '$route' () {
      this.showUserHistory = false
    },
    showUserHistory () {
      // Use bootstrap's class to disable scrolling on the body
      document.body.classList.toggle('modal-open', this.showUserHistory)
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
    toggleUserHistory () {
      this.showUserHistory = !this.showUserHistory
    },
    saveComponentHeight () {
      const height = `${this.$el.offsetHeight}px`
      // Save component height in a CSS variable after it's been update
      this.$root.$el.style.setProperty('--app-footer-height', height)
    },
    getServerVersion () {
      return this.promise.then(res => {
        this.serverHash = res['git.commit.id.abbrev']
        this.serverVersion = res['git.build.version']
      }).catch(() => {})
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
    },
    deleteAll () {
      this.$store.dispatch('indexing/deleteAll').then(() => EventBus.$emit('index::delete::all'))
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
    background: #222;

    &__addon {
      padding: 0 .5em;
      height: $app-footer-height;
      display: flex;
      align-items: center;

      &--analyze-documents.btn {
        border-left: 1px solid  rgba(white, .1);
      }

      &--homedir {
        border-left: 1px solid #333;
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

    &__user-history-backdrop {
      position: absolute;
      bottom: 100%;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(black, .8);

      &.fade-enter-active, &.fade-leave-active {
        transition: .3s;
      }

      &.fade-enter, &.fade-leave-to {
        opacity: 0;
      }
    }

    &__user-history {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      border-bottom: 1px solid #333;

      &:before {
        content: "";
      }
    }
  }
</style>
