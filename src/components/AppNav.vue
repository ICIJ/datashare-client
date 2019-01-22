<template>
  <headroom :z-index="1000" :offset="250" :on-unpin="onPin">
    <header class="app__nav" :class="{ 'app__nav--collapse': collapseMenu }">
      <transition name="fade">
        <div class="app__nav__mask" v-if="!collapseMenu" @click="toggleMenu"></div>
      </transition>
      <div class="app__nav__container row no-gutters">
        <div class="app__nav__container__main col row no-gutters">
          <router-link class="app__nav__container__main__brand col" :to="{ name: 'search' }">
            <div class="sr-only">
              ICIJ
            </div>
            <div>
              Datashare
            </div>
          </router-link>
          <div class="app__nav__container__main__search-bar col" v-if="isntLanding()">
            <search-bar />
          </div>
          <a class="app__nav__container__main__hamburger col" @click.prevent="toggleMenu()" href="#">
            <font-awesome-icon icon="bars" />
          </a>
          <ul class="app__nav__container__main__menu list-unstyled col" :class="{ 'app__nav__container__main__menu--collapse': collapseMenu }">
            <li class="list-unstyled-item app__nav__container__main__menu__item">
              <a :href="getAddDocumentsLink()" target="_blank">
                {{ $t('menu.addDocuments') }}
              </a>
            </li>
            <li class="list-unstyled-item app__nav__container__main__menu__item">
              <router-link :to="{ name: 'indexing' }">
                {{ $t('menu.analyse') }}
              </router-link>
            </li>
            <li class="list-unstyled-item app__nav__container__main__menu__item">
              <a href="https://icij.gitbook.io/datashare" target="_blank">
                {{ $t('menu.faq') }}
              </a>
            </li>
            <li class="list-unstyled-item app__nav__container__main__menu__item">
              <a href="https://jira.icij.org/servicedesk/customer/portal/4/create/108" target="_blank">
                {{ $t('menu.help') }}
              </a>
            </li>
            <li class="list-unstyled-item app__nav__container__main__menu__item logout" v-if="isRemote">
              <a :href="logoutLink">
                <font-awesome-icon icon="sign-out-alt" class="mr-1" />
                {{ $t('menu.logout') }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  </headroom>
</template>

<script>
import Vue from 'vue'
import { headroom } from 'vue-headroom'
import SearchBar from './SearchBar'
import DatashareClient from '../api/DatashareClient'
import getOS from '@/utils/user'

export default {
  name: 'AppNav',
  components: {
    headroom,
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
    },
    isRemote () {
      return Vue.prototype.config && Vue.prototype.config.mode === 'SERVER'
    }
  },
  watch: {
    '$route' (to, from) {
      this.collapseMenu = true
    }
  },
  methods: {
    toggleMenu () {
      this.collapseMenu = !this.collapseMenu
    },
    isntLanding () {
      return this.$route.name !== 'landing'
    },
    onPin () {
      this.$root.$emit('bv::hide::popover')
    },
    getAddDocumentsLink () {
      let link
      switch (getOS()) {
        case 'mac' :
          link = 'https://icij.gitbook.io/datashare/mac/how-to-add-documents-to-datashare'
          break
        case 'windows' :
          link = 'https://icij.gitbook.io/datashare/windows/how-to-add-documents-to-datashare'
          break
        case 'linux' :
          link = 'https://icij.gitbook.io/datashare/linux/how-to-add-documents-to-datashare'
          break
        default :
          link = 'https://icij.gitbook.io/datashare/'
      }
      return link
    }
  }
}
</script>

<style lang="scss">
  .app__nav {
    z-index: $zindex-fixed;
    position: relative;
    width: 100%;
    color: $body-color;
    width: auto;
    min-height: $app-nav-height;
    background: $body-bg;
    box-shadow: 0 2px 10px 0 rgba(black,.05);

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
        background:white;
        min-height: $app-nav-height;
        white-space: nowrap;

        &__brand.col, &__brand:hover, &__brand:focus {
          color: inherit;
          position: relative;
          display: inline-block;
          padding: $spacer;
          pointer-events: auto;
          max-width: 320px;

          @include media-breakpoint-down(md) {
            max-width: 220px;
          }

          &:before {
            content:"";
            background: url('~images/icij-white@2x.png') no-repeat 0 0;
            background-size: cover;
            filter: invert(100%);
            width: $app-nav-brand-height;
            height: $app-nav-brand-height;
            display: inline-block;
            z-index: $zindex-fixed + 20;
            border:1px solid white;
            position: absolute;
            top: $spacer;
            left: $spacer;
          }

          & > * {
            font-size: 1.5rem;
            display: inline-block;
            line-height: $line-height-base;
            padding-left: $spacer;
            margin-left: $app-nav-brand-height + $spacer;
          }
        }

        &__search-bar.col {
          position: relative;
          max-width: 550px;
          padding: 0 $spacer;

          .search-settings__popover {
            transform: translateY($spacer);
          }
        }

        & &__hamburger {
          cursor: pointer;
          color: inherit;
          pointer-events: auto;
          max-width: 3.5rem;
          font-size: 1.5rem;
          line-height: $app-nav-height;
          height: $app-nav-height;
          display: none;
          text-align: center;
          margin-left: auto;

          @include media-breakpoint-down(lg) {
            display: block;
          }
        }

        &__menu {
          display: flex;
          flex-grow: 1;
          margin: 0;

          @include media-breakpoint-down(lg) {
            display: block;
            transition: opacity 300ms;

            .app__nav--collapse & {
              opacity: 0;
              pointer-events: none;
            }

            &.col {
              border-radius: $dropdown-border-radius;
              position: absolute;
              right: 0;
              top: 100%;
              margin: $spacer;
              max-width: 280px;
              background: $body-bg;
              border: $gray-200 1px solid;
              box-shadow: 0 2px 10px 0 rgba(black,.05);

              &:before {
                content:"";
                border: ($spacer / 2) solid transparent;
                border-bottom-color: $body-bg;
                position: absolute;
                bottom: 100%;
                right: $spacer;
              }
            }

            &.col &__item {
              a {
                display: block;
                border-bottom: $gray-200 1px solid;
                padding: $spacer;
              }

              &:last-child a {
                border-bottom: 0;
              }
            }
          }

          &__item {
            & > a {
              padding: $spacer * 1.5 $spacer;
              display: inline-block;
              color: $body-color;
              font-weight: bolder;
              position: relative;
              transition: .4s;
              font-family: $headings-font-family;
              border-bottom: 3px solid transparent;

              &:hover {
                color: theme-color('icij');
                text-decoration: none;
                border-color: theme-color('icij');
              }
            }
          }
        }
      }
    }
  }
</style>
