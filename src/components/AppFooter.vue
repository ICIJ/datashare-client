<template>
  <div class="app__footer">
    <transition name="fade">
      <div v-show="showUserHistory" class="app__footer__user-history-backdrop" @click="toggleUserHistory"></div>
    </transition>
    <slide-up-down :active="showUserHistory" class="app__footer__user-history">
      <user-history v-if="showUserHistory" />
    </slide-up-down>
    <div class="d-flex align-items-center text-nowrap">
      <confirm-button class="app__footer__addon app__footer__addon--delete-index btn btn-sm text-secondary" :confirmed="deleteAll" :title="$t('indexing.delete_index_label')" v-b-tooltip :label="$t('indexing.delete_index_label')" :description="$t('indexing.delete_index_description')" v-if="!isServer">
        <fa icon="trash-alt" />
        <span class="sr-only">{{ $t('indexing.delete_index_label') }}</span>
      </confirm-button>
      <router-link :to="{ name: 'indexing' }"  class="app__footer__addon app__footer__addon--analyze-documents btn btn-sm text-secondary" :title="$t('menu.analyse')" v-b-tooltip v-if="!isServer">
        <fa icon="rocket" />
        <span class="sr-only">{{ $t('menu.analyse') }}</span>
      </router-link>
      <div class="app__footer__addon app__footer__addon--homedir" :title="$t('footer.homedir')" v-b-tooltip v-if="!isServer">
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
      <div class="app__footer__addon app__footer__addon--locale">
        <b-dropdown variant="link" size="sm" no-caret>
          <template #button-content>
            <fa icon="globe" class="mr-1" />
            {{ currentLanguage.label }}
          </template>
          <b-dropdown-item v-for="locale in locales" :key="locale.key" @click.prevent="changeLanguage(locale.key)" :active="locale === currentLanguage">
            {{ locale.label }}
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'
import utils from '@/mixins/utils'
import DatashareClient from '@/api/DatashareClient'
import UserHistory from '@/components/UserHistory'
import settings from '@/utils/settings'

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
      locales: settings.locales,
      loadedLocales: [ settings.defaultLocale ]
    }
  },
  mounted () {
    this.$root.$on('history::toggle', this.toggleUserHistory)
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
      const locale = localStorage.getItem('locale') ? localStorage.getItem('locale') : this.$i18n.locale
      this.loadLanguageAsync(locale)
      return find(this.locales, { key: locale })
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
    changeLanguage (locale) {
      this.loadLanguageAsync(locale)
    },
    setI18nLanguage (locale) {
      localStorage.setItem('locale', locale)
      this.$i18n.locale = locale
      return locale
    },
    loadLanguageAsync (locale) {
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
    },
    async deleteAll () {
      await this.$store.dispatch('indexing/deleteAll')
      this.$store.commit('userHistory/clear')
      this.$root.$emit('index::delete::all')
    }
  }
}
</script>

<style lang="scss">
  .app__footer {
    z-index: $zindex-fixed;
    position: fixed;
    bottom: 0;
    right: 0;
    left: var(--app-sidebar-width);
    height: $app-footer-height;
    font-size: 0.8rem;
    background: $app-footer-bg;
    color: $app-footer-color;

    &__addon {
      padding: 0 .5em;
      height: $app-footer-height;
      display: flex;
      align-items: center;

      &--analyze-documents.btn {
        border-left: 1px solid  rgba($app-footer-color, .1);
      }

      &--homedir {
        border-left: 1px solid #333;
        font-family: $font-family-monospace;
      }

      &--version {
        font-weight: bold;
      }

      &--locale {
        .btn, .btn:hover, .btn:focus {
          border: none;
          color: $app-footer-color;
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
      background: rgba($modal-backdrop-bg, $modal-backdrop-opacity);

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
