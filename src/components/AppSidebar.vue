<template>
  <div class="app-sidebar d-flex flex-column" :class="{ 'app-sidebar--reduced': reduced }">
    <div class="app-sidebar__backdrop" @click="hideSidebar()"></div>
    <vue-perfect-scrollbar class="app-sidebar__container flex-grow-1 d-flex flex-column">
      <div class="d-flex align-items-center justify-content-center">
        <router-link class="app-sidebar__container__brand align-items-center flex-grow-1" :to="{ name: 'landing' }">
          <img src="~images/logo-white.svg" alt="Datashare" class="app-sidebar__container__brand__logo">
          <span class="app-sidebar__container__brand__beta">beta</span>
        </router-link>
        <div>
          <a @click="hideSidebar()" class="app-sidebar__container__toggle text-white">
            <fa icon="bars"></fa>
          </a>
        </div>
      </div>
      <hook name="app-sidebar.menu:before"></hook>
      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <router-link
            class="app-sidebar__container__menu__item__link"
            :title="$t('menu.search')"
            :to="{ name: 'search', query }"
            v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="search" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t(reduced ? 'menu.searchShort' : 'menu.search') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <router-link
            class="app-sidebar__container__menu__item__link"
            :title="$t('menu.batch')"
            :to="{ name: 'batch-search' }"
            v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="layer-group" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t(reduced ? 'menu.batchShort' : 'menu.batch') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--documents"
            v-if="!isServer">
          <router-link
            class="app-sidebar__container__menu__item__link"
            :title="$t('menu.analyse')"
            :to="{ name: 'indexing' }"
            v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="rocket" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t(reduced ? 'menu.analyseShort' : 'menu.analyse') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <router-link
            class="app-sidebar__container__menu__item__link"
            @click.prevent="$root.$emit('history::toggle')"
            :title="$t('menu.history')"
            :to="{ name: 'user-history' }"
            v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="clock" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t(reduced ? 'menu.historyShort' : 'menu.history') }}
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <router-link
            class="app-sidebar__container__menu__item__link"
            :title="$t('menu.insights')"
            :to="{ name: 'insights' }"
            v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="chart-bar" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t(reduced ? 'menu.insightsShort' : 'menu.insights') }}
            </span>
          </router-link>
        </li>
        <template>
          <li class="app-sidebar__container__menu__item">
            <router-link
              class="app-sidebar__container__menu__item__link"
              :title="$t('menu.settings')"
              :to="{ name: 'settings' }"
              v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
              <fa icon="cog" fixed-width></fa>
              <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
                {{ $t(reduced ? 'menu.settingsShort' : 'menu.settings') }}
              </span>
            </router-link>
          </li>
        </template>
      </ul>
      <hook name="app-sidebar.menu:after"></hook>
      <hook name="app-sidebar.help:before"></hook>
      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <a class="app-sidebar__container__menu__item__link"
             :href="faqLink"
             target="_blank"
             :title="$t('menu.faq')" v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="question" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t(reduced ? 'menu.faqShort' : 'menu.faq') }}
            </span>
          </a>
        </li>
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--help">
          <a class="app-sidebar__container__menu__item__link"
             :href="helpLink"
             target="_blank"
             :title="$t('menu.help')"
             v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="ambulance" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t(reduced ? 'menu.helpShort' : 'menu.help') }}
            </span>
          </a>
        </li>
      </ul>
      <hook name="app-sidebar.help:after"></hook>
      <hook name="app-sidebar.guides:before"></hook>
      <div v-if="currentRouteDocs.length">
        <div v-if="!reduced">
          <h5 class="app-sidebar__container__heading">
            <fa icon="book" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__heading__label">
              {{ $t(reduced ? 'menu.userGuidesShort' : 'menu.userGuides') }}
            </span>
          </h5>
          <ul class="app-sidebar__container__menu app-sidebar__container__menu--borderless list-unstyled">
            <li class="app-sidebar__container__menu__item" v-for="meta in currentRouteDocs" :key="meta.resourcePath">
              <router-link class="app-sidebar__container__menu__item__link app-sidebar__container__menu__item__link--tree"
                           :to="{ name: 'docs', params: meta }">
                <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
                  {{ meta.title }}
                </span>
              </router-link>
            </li>
          </ul>
        </div>
        <ul v-else class="app-sidebar__container__menu list-unstyled">
          <li class="app-sidebar__container__menu__item"  :data-badge="currentRouteDocs.length">
            <b-button class="app-sidebar__container__menu__item__link"
                      :data-badge="currentRouteDocs.length"
                      href="#"
                      id="app-menu-user-guide"
                      variant="none">
              <fa icon="book" fixed-width></fa>
              <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
                {{ $t(reduced ? 'menu.userGuidesShort' : 'menu.userGuides') }}
              </span>
              <b-popover target="app-menu-user-guide"
                         custom-class="popover-body-p-0"
                         triggers="click blur"
                         @show="$root.$emit('bv::hide::tooltip')">
                <div class="dropdown-menu show position-static border-0 px-2 bg-transparent">
                  <router-link class="dropdown-item"
                               :key="meta.resourcePath"
                               :to="{ name: 'docs', params: meta }"
                               v-for="meta in currentRouteDocs">
                    {{ meta.title }}
                  </router-link>
                </div>
              </b-popover>
            </b-button>
          </li>
        </ul>
      </div>
      <hook name="app-sidebar.guides:after"></hook>
      <hook name="app-sidebar.locales:before"></hook>
      <ul class="app-sidebar__container__menu list-unstyled mb-0">
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--locale">
          <locales-menu class="app-sidebar__container__menu__item__link text-wrap" v-slot="{ currentLocale }">
            <fa icon="globe" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ currentLocale.label }}
            </span>
          </locales-menu>
        </li>
        <li class="app-sidebar__container__menu__item app-sidebar__container__menu__item--logout" v-if="isServer">
          <a class="app-sidebar__container__menu__item__link"
             :href="logoutLink"
             title="Logout"
             v-b-tooltip.right="{ customClass: tooltipsClass, id: 'app-sidebar-link-label' }">
            <fa icon="sign-out-alt" fixed-width></fa>
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              {{ $t('menu.logoutShort') }}
            </span>
          </a>
        </li>
      </ul>
      <hook name="app-sidebar.locales:after"></hook>
    </vue-perfect-scrollbar>
    <div class="app-sidebar__version">
      <version-number class="d-inline-block"
                      :label="reduced ? '' : 'Version'"
                      :no-icon="reduced"
                      :tooltip-placement="reduced ? 'righttop' : 'top'"></version-number>
    </div>
    <div class="app-sidebar__data-location" v-if="!isServer" v-show="!reduced">
      <mounted-data-location></mounted-data-location>
    </div>
  </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

import Api from '@/api'
import Hook from '@/components/Hook'
import LocalesMenu from '@/components/LocalesMenu'
import MountedDataLocation from '@/components/MountedDataLocation'
import VersionNumber from '@/components/VersionNumber'
import docs from '@/mixins/docs'
import utils from '@/mixins/utils'
import settings from '@/utils/settings'

/**
 * The global app sidebar.
 */
export default {
  name: 'AppSidebar',
  mixins: [docs, utils],
  components: {
    Hook,
    LocalesMenu,
    MountedDataLocation,
    VersionNumber,
    VuePerfectScrollbar
  },
  computed: {
    query () {
      return this.$store.getters['search/toRouteQueryWithStamp']()
    },
    tooltipsClass () {
      return this.reduced ? '' : 'd-none'
    },
    logoutLink () {
      return Api.getFullUrl(process.env.VUE_APP_DS_AUTH_SIGNOUT)
    },
    helpLink () {
      return this.$config.get('helpLink', settings.helpLink)
    },
    faqLink () {
      return this.$config.get('faqLink', settings.faqLink)
    },
    reduced: {
      get () {
        return this.$store.state.app.sidebar.reduced
      },
      set (toggle) {
        return this.$store.dispatch('app/toggleSidebar', toggle)
      }
    }
  },
  watch: {
    $route () {
      this.$root.$emit('bv::hide::tooltip', 'app-sidebar-link-label')
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
      this.$root.$el.style.setProperty('--core-sidebar-width', width)
    }
  }
}
</script>

<style lang="scss" scoped>
  $item-tree-color: rgba($app-sidebar-color, .5);
  $item-tree-width: 2px;

  .app-sidebar {
    background: $app-sidebar-bg;
    bottom: 0;
    box-shadow: 0 0 $app-sidebar-width / 2 0 #000;
    color: $app-sidebar-color;
    height: 100vh;
    left: 0;
    max-width: $app-sidebar-width;
    min-width: 60px;
    position: fixed;
    top: 0;
    width: $app-sidebar-width;
    z-index: $zindex-sticky;

    &--reduced {
      box-shadow: none;
      width: $app-sidebar-reduced-width;
    }

    &__backdrop {
      background: rgba($modal-backdrop-bg, $modal-backdrop-opacity);
      bottom: 0;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      z-index: -1;

      .app-sidebar--reduced & {
        display: none;
      }
    }

    &__container {
      &__brand, &__brand:hover, &__brand:focus, &__brand {
        color: inherit;
        display: flex;
        font-size: 1.5rem;
        justify-content: flex-start;
        max-width: $app-context-sidebar-width;
        padding: $spacer;
        pointer-events: auto;
        text-decoration: none;
        width: 100%;

        .app-sidebar--reduced & {
          display: none;
        }
      }

      &__brand__logo {
        height: $app-nav-brand-height;
      }

      &__brand__beta {
        background: $saddle-red;
        color: $app-sidebar-color;
        display: inline-block;
        font-size: .6em;
        height: auto;
        margin-left: 0.5em;
        padding: .05em .2em;
        position: relative;
        top: -0.5em;+

        .app-sidebar--reduced & {
          display: none;
        }
      }

      &__toggle {
        margin: $spacer;
        height: 40px;
        width: 40px;
        text-align: center;
        line-height: 40px;
        display: block;
        border-radius: 1.5rem;
        padding: 0;

        &:hover {
          background: $app-sidebar-border-color;
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

        .app-sidebar--reduced & {
          margin: $spacer-xs $spacer-xs 0;
          flex-direction: column;
          text-align: center;
          padding: $spacer-lg $spacer-xs $spacer;
        }

        &:not(&--borderless):before {
          content:"";
          border-top: $app-sidebar-border-color 1px solid;
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

          .app-sidebar--reduced & {
            margin: 0 auto $spacer-xs;
            display: block;
          }
        }

        &__label {

          .app-sidebar--reduced & {
            font-size: 0.7rem;
          }
        }
      }

      &__menu {
        position: relative;
        padding-top: $spacer;
        margin-bottom: $spacer;

        &:not(&--borderless):before {
          content:"";
          border-top: $app-sidebar-border-color 1px solid;
          position: absolute;
          top: 0;
          left: $spacer;
          right: $spacer;
        }

        &--borderless {
          padding-top: 0;
        }

        &__item {
          position: relative;

          &:last-of-type &__link--tree:before {
            transform: none;
            height: calc(50% + #{$item-tree-width / 2});
            top: 0;
          }

          &__link, &__link.btn {
            margin: $spacer-xs $spacer;
            padding: $spacer-sm;
            color: $app-sidebar-link-color;
            display: flex;
            border-radius: $border-radius;
            font-size: $font-size-sm;
            font-weight: bold;

            .app-sidebar--reduced & {
              flex-direction: column;
              text-align: center;
              margin: $spacer-xs;
              padding: $spacer-sm $spacer-xs $spacer-xs;
            }

            &.router-link-active, &:hover, &:active {
              background: mix($app-sidebar-color, $app-sidebar-bg, 5%);
              color: $app-sidebar-color;
            }

            &.router-link-active:before {
              background: $secondary;
              bottom: 0;
              box-shadow: 2px 0 $spacer 0 $secondary;
              content: "";
              left: 0;
              position: absolute;
              top: 0;
              width: 2px;
            }

            &.router-link-active .svg-inline--fa {
              color: $secondary;
            }

            &[data-badge]:after {
              content: attr(data-badge);
              position: absolute;
              left: calc(50% + 0.5em);
              top: 0.25em;
              background: $secondary;
              color: white;
              font-size: 0.75em;
              font-weight: $badge-font-weight;
              padding: $badge-padding-y $badge-padding-x;
              border-radius: $badge-border-radius;
            }

            &--disabled,
            &--disabled:hover {
              color: $text-muted;
              cursor: not-allowed;
              text-decoration: none;
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

              .app-sidebar--reduced & {
                margin: 0 auto $spacer-xs;
                display: block;
              }
            }

            &__label {

              .app-sidebar--reduced & {
                font-size: 0.7rem;
              }
            }
          }
        }
      }
    }

    &__version {
      z-index: 100;
      position: relative;
      text-align: left;

      &:before {
        content: "";
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        height: $spacer;
        pointer-events: none;
      }

      .app-sidebar--reduced & {
        text-align: center;
        padding: 0 0 $spacer;
      }
    }

    &__version, &__data-location {
      color: $app-sidebar-link-color;
      padding: 0 $spacer * 1.7 $spacer $spacer * 1.5;
      font-size: $font-size-sm;
    }
  }
</style>
