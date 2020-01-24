<template>
  <div class="app-sidebar d-flex flex-column" :class="{ 'app-sidebar--reduced': reduced }">
    <div class="app-sidebar__backdrop" @click="hideSidebar()"></div>
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
      <hook name="app-sidebar.menu:before" />
      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <router-link :to="{ name: 'search', query }" class="app-sidebar__container__menu__item__link" title="Search in documents" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="search" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.search') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <router-link :to="{ name: 'batch-search' }" class="app-sidebar__container__menu__item__link" title="Batch searches" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="layer-group" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.batch') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--documents" v-if="$config.is('manageDocuments')">
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
      <hook name="app-sidebar.menu:after" />
      <hook name="app-sidebar.help:before" />
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
          <a :href="$config.get('helpLink')" target="_blank" class="app-sidebar__container__menu__item__link" title="Ask for help" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="ambulance" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.help') }}
            </span>
          </a>
        </li>
      </ul>
      <hook name="app-sidebar.help:after" />
      <hook name="app-sidebar.guides:before" />
      <div v-if="!reduced && currentRouteDocs.length">
        <h5 class="app-sidebar__container__heading">
          <fa icon="book" fixed-width />
          <span>User guides</span>
        </h5>
        <ul class="app-sidebar__container__menu app-sidebar__container__menu--borderless list-unstyled">
          <li class="app-sidebar__container__menu__item" v-for="meta in currentRouteDocs" v-bind:key="meta.resourcePath">
            <router-link :to="{ name: 'docs', params: meta }" class="app-sidebar__container__menu__item__link app-sidebar__container__menu__item__link--tree">
              <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
                {{ meta.title }}
              </span>
            </router-link>
          </li>
        </ul>
      </div>
      <hook name="app-sidebar.guides:after" />
      <hook name="app-sidebar.locales:before" />
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
          <a :href="logoutLink" class="app-sidebar__container__menu__item__link" title="Logout" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="sign-out-alt" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.logout') }}
            </span>
          </a>
        </li>
      </ul>
      <hook name="app-sidebar.locales:after" />
    </vue-perfect-scrollbar>
    <div class="app-sidebar__version text-left">
      <version-number :tooltip-placement="reduced ? 'righttop' : 'top'" :label="reduced ? '' : 'Version'" class="d-inline-block" :no-icon="reduced" />
    </div>
    <div class="app-sidebar__data-location" v-if="$config.is('manageDocuments')" v-show="!reduced">
      <mounted-data-location />
    </div>
  </div>
</template>

<script>
import docs from '@/mixins/docs'
import utils from '@/mixins/utils'
import { isNarrowScreen } from '@/utils/screen'
import DatashareClient from '@/api/DatashareClient'
import LocalesDropdown from './LocalesDropdown.vue'
import MountedDataLocation from './MountedDataLocation.vue'
import VersionNumber from './VersionNumber.vue'
import Hook from './Hook.vue'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'AppSidebar',
  mixins: [docs, utils],
  components: {
    Hook,
    LocalesDropdown,
    MountedDataLocation,
    VersionNumber,
    VuePerfectScrollbar
  },
  data () {
    return {
      // Quick and dirty responsive default value
      reduced: isNarrowScreen()
    }
  },
  mounted () {
    this.$nextTick(this.saveComponentWidth)
  },
  watch: {
    $route () {
      this.reduced = isNarrowScreen() || this.reduced
    }
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
    logoutLink () {
      return DatashareClient.getFullUrl(process.env.VUE_APP_DS_AUTH_SIGNOUT)
    }
  }
}
</script>

<style lang="scss">
  $item-tree-width: 2px;
  $item-tree-color: rgba(white, .5);

  .app-sidebar {
    height: 100vh;
    color: white;
    background: $app-bg;
    min-width: 60px;
    max-width: $app-sidebar-width;
    width: $app-sidebar-width;
    position: sticky;
    top: 0;
    z-index: $zindex-sticky;

    &--reduced {
      width: $app-sidebar-reduced-width;
    }

    @media (max-width: $app-sidebar-float-breakpoint-width) {
      position: fixed;
      left: 0;
      bottom: 0;
    }

    @media (max-width: $app-sidebar-float-breakpoint-width) {
      &:not(&--reduced) {
        box-shadow: 0 0 2rem 1rem darken($app-bg, 10);

        .app-sidebar__backdrop {
          z-index: -1;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: rgba($modal-backdrop-bg, $modal-backdrop-opacity);
        }
      }
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

      &__heading {
        margin: $spacer * 0.5 0;
        padding: $spacer * 1.5 ($spacer * 1.75) 0;
        position: relative;
        display: flex;
        font-size: $font-size-sm;
        font-weight: bold;

        &:not(&--borderless):before {
          content:"";
          border-top: rgba(white, 0.1) 1px solid;
          position: absolute;
          top: 0;
          left: $spacer;
          right: $spacer;
        }

        & .svg-inline--fa {
          font-size: 1.2rem;

          .app-sidebar:not(.app-sidebar--reduced) & {
            margin-right: $spacer;
          }
        }
      }

      &__menu {
        position: relative;
        padding-top: $spacer;
        margin-bottom: $spacer;

        &:not(&--borderless):before {
          content:"";
          border-top: rgba(white, 0.1) 1px solid;
          position: absolute;
          top: 0;
          left: $spacer;
          right: $spacer;
        }

        &--borderless {
          padding-top: 0;
        }

        &__item {

          &:last-of-type &__link--tree:before {
            transform: none;
            height: calc(50% + #{$item-tree-width / 2});
            top: 0;
          }

          &__link, &__link.btn {
            margin: $spacer * 0.5 $spacer;
            padding: $spacer * 0.75;
            color: rgba(white, 0.6);
            display: flex;
            border-radius: 0;
            font-size: $font-size-sm;
            font-weight: bold;

            &.router-link-active, &:hover, &:active {
              color: white;
              background: rgba(white, .05);
            }

            &--tree {
              font-weight: normal;
              position: relative;
              padding: $spacer * 0.5 $spacer * 0.75;
              margin-top: 0;
              margin-bottom: 0;
              margin-left: $spacer * 3.25;

              &:before {
                content: "";
                position: absolute;
                right: calc(100% + #{$spacer / 2});
                top: 50%;
                transform: translateY(-50%);
                width: $item-tree-width;
                background: $item-tree-color;
                height: 100%;
              }

              &:after {
                content: "";
                position: absolute;
                right: 100%;
                top: 50%;
                transform: translateY(-50%);
                height: $item-tree-width;
                background: $item-tree-color;
                width: $spacer / 2;
              }
            }

            & .svg-inline--fa {
              font-size: 1.2rem;
              .app-sidebar:not(.app-sidebar--reduced) & {
                margin-right: $spacer;
              }
            }

            &__label {

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
    }

    &__version, &__data-location {
      color: rgba(white, 0.6);
      padding: 0 $spacer * 1.5 $spacer;
      font-size: $font-size-sm;
    }
  }
</style>
