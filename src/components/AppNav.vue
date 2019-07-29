<template>
  <header class="app__nav" :class="{ 'app__nav--collapse': collapseMenu }">
    <transition name="fade">
      <div class="app__nav__mask" v-if="!collapseMenu" @click="toggleMenu"></div>
    </transition>
    <div class="app__nav__container row no-gutters">
      <div class="app__nav__container__main col d-flex">
        <div class="app__nav__container__main__search-bar flex-grow-1 px-3" v-if="isntLanding()">
          <search-bar class="px-0" settings />
        </div>
        <!--
        <a class="app__nav__container__main__hamburger px-3 ml-auto" @click.prevent="toggleMenu()" href="#">
          <fa icon="bars" />
        </a>
        <ul class="app__nav__container__main__menu list-unstyled d-flex mb-0" :class="{ 'app__nav__container__main__menu--collapse': collapseMenu }">
          <li class="list-unstyled-item app__nav__container__main__menu__item border-right ml-auto" v-if="!isServer">
            <router-link :to="{ name: 'indexing' }">
              <fa icon="rocket" class="mr-1" />
              {{ $t('menu.analyse') }}
            </router-link>
          </li>
          <li class="list-unstyled-item app__nav__container__main__menu__item app__nav__container__main__menu__item--documents" v-if="!isServer">
            <a :href="getAddDocumentsLink()" target="_blank">
              {{ $t('menu.addDocuments') }}
            </a>
          </li>
          <li class="list-unstyled-item app__nav__container__main__menu__item" :class="{ 'ml-auto': isServer }">
            <a href="https://icij.gitbook.io/datashare" target="_blank">
              {{ $t('menu.faq') }}
            </a>
          </li>
          <li class="list-unstyled-item app__nav__container__main__menu__item app__nav__container__main__menu__item--help">
            <a :href="getHelpLink()" target="_blank">
              {{ $t('menu.help') }}
            </a>
          </li>
          <li class="list-unstyled-item app__nav__container__main__menu__item logout border-left" v-if="isServer">
            <a :href="logoutLink">
              <fa icon="sign-out-alt" class="mr-1" />
              {{ $t('menu.logout') }}
            </a>
          </li>
        </ul>
        -->
      </div>
    </div>
  </header>
</template>

<script>
import SearchBar from '@/components/SearchBar'
import settings from '@/utils/settings'
import utils from '@/mixins/utils'
import { getOS } from '@/utils/utils'
import DatashareClient from '@/api/DatashareClient'

export default {
  name: 'AppNav',
  mixins: [utils],
  components: {
    SearchBar
  },
  data () {
    return {
      collapseMenu: true
    }
  },
  computed: {
    logoutLink () {
      return DatashareClient.getFullUrl(process.env.VUE_APP_DS_AUTH_SIGNOUT)
    }
  },
  mounted () {
    this.saveComponentHeight()
  },
  updated () {
    this.saveComponentHeight()
  },
  watch: {
    '$route' (to, from) {
      this.collapseMenu = true
    }
  },
  methods: {
    saveComponentHeight () {
      const height = `${this.$el.offsetHeight}px`
      // Save component height in a CSS variable after it's been update
      this.$root.$el.style.setProperty('--app-nav-height', height)
    },
    toggleMenu () {
      this.collapseMenu = !this.collapseMenu
    },
    isntLanding () {
      return this.$route.name !== 'landing'
    },
    getAddDocumentsLink () {
      const os = getOS()
      return settings.documentationLinks.indexing[os] || settings.documentationLinks.indexing.default
    },
    getHelpLink () {
      return this.isServer ? 'https://jira.icij.org/servicedesk/customer/portal/4/create/108' : 'https://github.com/ICIJ/datashare/wiki/Datashare-Support'
    }
  }
}
</script>

<style lang="scss">
  .app__nav {
    z-index: 15;
    position: relative;
    width: 100%;
    color: $body-color;
    width: auto;

    &__mask {
      background: rgba(black, 0.5);
      position: fixed;
      top:0;
      left:0;
      width: 100vw;
      height: 100vh;
    }

    &__container {

      &__main {
        position:relative;
        z-index: $zindex-fixed + 30;
        border-radius: $border-radius-lg 0 0 0;
        min-height: var(--app-nav-height);
        white-space: nowrap;

        &__search-bar {
          position: relative;
          padding: 0;
        }

        & &__hamburger {
          cursor: pointer;
          color: inherit;
          pointer-events: auto;
          font-size: 1.5rem;
          line-height: var(--app-nav-height);
          height: var(--app-nav-height);
          display: none;
          text-align: center;

          @include media-breakpoint-down(lg) {
            display: block;
          }
        }

        &__menu {
          margin-left: auto;

          @include media-breakpoint-down(lg) {
            flex-direction: column;
            display: block;
            transition: opacity 300ms;
            border-radius: $dropdown-border-radius;
            position: absolute;
            right: 0;
            top: 100%;
            margin: $spacer;
            max-width: 280px;
            background: white;
            border: $gray-200 1px solid;
            box-shadow: 0 2px 10px 0 rgba(black,.05);

            &:before {
              content:"";
              border: ($spacer / 2) solid transparent;
              border-bottom-color: white;
              position: absolute;
              bottom: 100%;
              right: $spacer;
            }

            .app__nav--collapse & {
              opacity: 0;
              pointer-events: none;
            }

            &__item {

              a {
                display: block;
                border-bottom: $gray-200 1px solid;
                padding: $spacer;
                width:100%;
              }

              &:last-child a {
                border-bottom: 0;
              }
            }
          }

          &__item {

            & > a {
              height: 100%;
              padding: $spacer * 1.5 $spacer * 0.75;
              display: inline-block;
              color: $body-color;
              font-weight: bolder;
              position: relative;
              transition: .4s;
              font-family: $headings-font-family;

              &:hover, &.router-link-active {
                color: $secondary;
                text-decoration: none;
                border-color: $secondary;
                box-shadow:0 -3px 0 0 $secondary inset;
              }
            }
          }
        }
      }
    }
  }
</style>
