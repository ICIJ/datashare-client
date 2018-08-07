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
        </div>
        <ul class="app__nav__container__menu list-unstyled col" :class="{ 'app__nav__container__menu--collapse': collapseMenu }"  v-if="isntLanding()">
          <li class="list-unstyled-item app__nav__container__menu__item">
            <router-link :to="{ name: 'indexing' }">
              {{ $t('menu.analyse') }}
            </router-link>
          </li>
          <li class="list-unstyled-item app__nav__container__menu__item">
            <router-link :to="{ name: 'about' }">
              {{ $t('menu.about') }}
            </router-link>
          </li>
          <li class="list-unstyled-item app__nav__container__menu__item mr-auto">
            <a href="https://jira.icij.org/servicedesk/" target="_blank">
              {{ $t('menu.help') }}
            </a>
          </li>
          <li class="list-unstyled-item app__nav__container__menu__item">
            <a :href="logoutLink">
              <font-awesome-icon icon="sign-out-alt" class="mr-1" />
              {{ $t('menu.logout') }}
            </a>
          </li>
        </ul>
      </div>
    </header>
  </headroom>
</template>

<script>
import { headroom } from 'vue-headroom'
import SearchBar from './SearchBar'
import DatashareClient from '../api/DatashareClient'

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
    }
  },
  computed: {
    logoutLink () {
      return DatashareClient.getFullUrl(process.env.VUE_APP_DS_AUTH_SIGNOUT)
    }
  }
}
</script>

<style lang="scss">
  html body .app__nav {
    z-index: $zindex-fixed;
    position: relative;
    width: 100%;
    color: $body-color;
    width: auto;
    min-height: $app-nav-height;
    background: $body-bg;
    border-bottom: $gray-200 1px solid;
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
        max-width: 320px + 550px;

        &__brand, &__brand:hover, &__brand:focus {
          color: inherit;
          position: relative;
          display: inline-block;
          margin-left: $spacer;
          margin-top: $spacer;
          pointer-events: auto;
          max-width: calc(320px - #{$spacer});

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
            top:0;
            left:0;
          }

          & > * {
            font-size: 1.5rem;
            display: inline-block;
            line-height: $line-height-base;
            padding-left: $spacer;
            margin-left: $app-nav-brand-height;
          }
        }

        & &__search-bar {
          position: relative;
          max-width: 550px;
          padding: 0 $spacer;
        }

        &__hamburger {
          cursor: pointer;
          color: inherit;
          pointer-events: auto;
        }
      }

      &__menu {
        display: flex;
        flex-grow: 1;
        margin: 0;

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
</style>
