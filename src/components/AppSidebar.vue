<template>
  <div class="app-sidebar d-flex flex-column" :class="{ 'app-sidebar--reduced': reduced }">
    <vue-perfect-scrollbar class="app-sidebar__container flex-grow-1 d-flex flex-column">
      <div class="d-flex align-items-center justify-content-center">
        <router-link class="app-sidebar__container__brand align-items-center flex-grow-1" :to="{ name: 'landing' }">
          <img src="~images/logo-white.svg" alt="Datashare" class="app-sidebar__container__brand__logo" />
          <span class="app-sidebar__container__brand__beta">beta</span>
        </router-link>
        <div>
          <a @click="hideSidebar()" class="app-sidebar__container__toggler">
            <fa icon="bars" />
          </a>
        </div>
      </div>
      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <router-link :to="{ name: 'search', query }" class="app-sidebar__container__menu__item__link" title="Search in documents" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="search" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.search') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item" v-if="hasFeature('BATCH_SEARCHES')">
          <router-link :to="{ name: 'batch-search' }" class="app-sidebar__container__menu__item__link" title="Batch searches" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="layer-group" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.batch') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--documents" v-if="!isServer">
          <router-link :to="{ name: 'indexing' }" class="app-sidebar__container__menu__item__link" title="Analyze my documents" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="rocket" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.analyse') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <router-link :to="{ name: 'user-history' }" class="app-sidebar__container__menu__item__link" title="Your history" v-b-tooltip.right="{ customClass: tooltipsClass }" @click.prevent="$root.$emit('history::toggle')">
            <fa icon="clock" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.history') }}
            </span>
          </router-link>
        </li>
      </ul>
      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <a href="https://icij.gitbook.io/datashare/faq/" target="_blank" class="app-sidebar__container__menu__item__link" title="FAQ" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="question" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.faq') }}
            </span>
          </a>
        </li>
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--help">
          <a :href="helpLink" target="_blank" class="app-sidebar__container__menu__item__link" title="Ask for help" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="ambulance" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.help') }}
            </span>
          </a>
        </li>
        <li class="app-sidebar__container__menu__item" v-for="meta in currentRouteDocs" v-bind:key="meta.resourcePath">
          <router-link :to="{ name: 'docs', params: meta }" class="app-sidebar__container__menu__item__link">
            <fa icon="book" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ meta.title }}
            </span>
          </router-link>
        </li>
      </ul>
      <ul class="app-sidebar__container__menu list-unstyled mb-0">
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--locale">
          <locales-dropdown class="app-sidebar__container__menu__item__link text-left text-wrap" v-slot="{ currentLocale }">
            <fa icon="globe" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ currentLocale.label }}
            </span>
          </locales-dropdown>
        </li>
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--logout" v-if="isServer">
          <a href="" class="app-sidebar__container__menu__item__link" title="Logout" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="sign-out-alt" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.logout') }}
            </span>
          </a>
        </li>
      </ul>
    </vue-perfect-scrollbar>
    <div class="app-sidebar__version text-left">
      <version-number :tooltip-placement="reduced ? 'righttop' : 'top'" :label="reduced ? '' : 'Version'" class="d-inline-block" :no-icon="reduced" />
    </div>
    <div class="app-sidebar__data-location" v-if="!reduced && !isServer">
      <mounted-data-location />
    </div>
  </div>
</template>

<script>
import { getOS } from '@/utils/utils'
import utils from '@/mixins/utils'
import features from '@/mixins/features'
import docs from '@/mixins/docs'
import settings from '@/utils/settings'
import LocalesDropdown from './LocalesDropdown.vue'
import MountedDataLocation from './MountedDataLocation.vue'
import VersionNumber from './VersionNumber.vue'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'AppSidebar',
  mixins: [docs, features, utils],
  components: {
    LocalesDropdown,
    MountedDataLocation,
    VersionNumber,
    VuePerfectScrollbar
  },
  data () {
    return {
      reduced: false
    }
  },
  mounted () {
    this.$nextTick(this.saveComponentWidth)
  },
  methods: {
    hideSidebar () {
      this.reduced = !this.reduced
      this.$nextTick(this.saveComponentWidth)
    },
    saveComponentWidth () {
      const width = `${this.$el.offsetWidth}px`
      // Save component width in a CSS variable after it's been update
      this.$root.$el.style.setProperty('--app-sidebar-width', width)
    }
  },
  computed: {
    query () {
      return this.$store.getters['search/toRouteQueryWithStamp']
    },
    tooltipsClass () {
      return this.reduced ? '' : 'd-none'
    },
    addDocumentsLink () {
      const os = getOS()
      return settings.documentationLinks.indexing[os] || settings.documentationLinks.indexing.default
    },
    helpLink () {
      return this.isServer ? 'https://jira.icij.org/servicedesk/customer/portal/4/create/108' : 'https://github.com/ICIJ/datashare/wiki/Datashare-Support'
    }
  }
}
</script>

<style lang="scss">
  .app-sidebar {
    height: 100vh;
    color: white;
    background: $app-bg;
    min-width: 60px;
    max-width: $app-sidebar-width;
    width: $app-sidebar-width;
    position: sticky;
    top: 0;

    &--reduced {
      width: auto;
    }

    &__container {

      &__brand, &__brand:hover, &__brand:focus, &__brand {
        color: inherit;
        padding: $spacer;
        pointer-events: auto;
        max-width: $app-context-sidebar-width;
        width: 100%;
        font-size: 1.5rem;
        text-decoration: none;
        justify-content: flex-start;
        display: flex;

        .app-sidebar--reduced & {
          display: none;
        }
      }

      &__brand__logo {
        height: $app-nav-brand-height;
      }

      &__brand__beta {
        font-size: .6em;
        background: $saddle-red;
        padding: .05em .2em;
        display: inline-block;
        height: auto;
        color: white;
        position: relative;
        top: -0.5em;
        margin-left: 0.5em;

        .app-sidebar--reduced & {
          display: none;
        }
      }

      &__toggler {
        margin: $spacer;
        height: 40px;
        width: 40px;
        text-align: center;
        line-height: 40px;
        display: block;
        border-radius: 1.5rem;
        padding: 0;

        &:hover {
          background: rgba(white, 0.1);
        }

        .app-sidebar--reduced & {
          transform: rotate(180deg);
          transform-origin: center center;
        }
      }

      &__menu {
        position: relative;
        padding-top: $spacer;
        margin-bottom: $spacer;

        &:before {
          content:"";
          border-top: rgba(white, 0.1) 1px solid;
          position: absolute;
          top: 0;
          left: $spacer;
          right: $spacer;
        }

        &.border-0:before {
          display: none;
        }

        &__item {

          &__link, &__link.btn {
            margin: $spacer * 0.5 $spacer;
            padding: $spacer * 0.75;
            color: rgba(white, 0.6);
            display: flex;
            border-radius: 0;
            font-size: 0.9rem;
            font-weight: bold;

            &.router-link-active, &:hover, &:active {
              color: white;
              background: rgba(white, .05);
            }

            & > .svg-inline--fa {
              font-size: 1.2rem;
            }

            &__label {
              margin-left: $spacer;

              .app-sidebar--reduced & {
                display: none;
              }
            }
          }
        }
      }
    }

    &__version {
      z-index: 100;
      position: relative;
      box-shadow: 0 -0.5 * $spacer 0.5 * $spacer 0 $app-bg;
    }

    &__version, &__data-location {
      color: rgba(white, 0.6);
      padding: 0 $spacer * 1.5 $spacer;
      font-size: 0.8rem;
    }
  }
</style>
