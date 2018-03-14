<template>
  <headroom :z-index="1000">
    <header class="app__nav" :class="{ 'app__nav--collapse': collapseMenu }">
      <transition name="fade">
        <div class="app__nav__mask" v-if="!collapseMenu" @click="toggleMenu"></div>
      </transition>
      <div class="app__nav__container">
        <div class="clearfix app__nav__container__main">
          <router-link class="app__nav__container__main__brand" :to="{ name: 'search' }">
            <div class="sr-only">
              ICIJ
            </div>
          </router-link>
          <button class="btn btn-link btn-lg float-right mt-2 app__nav__container__main__hamburger" @click="toggleMenu">
            <font-awesome-icon icon="bars" size="2x" />
          </button>
        </div>
        <ul class="app__nav__container__menu list-unstyled" :class="{ 'app__nav__container__menu--collapse': collapseMenu }">
          <li class="list-unstyled-item app__nav__container__menu__item p-3">
            <language-chooser @changed="toggleMenu" />
          </li>
          <li class="list-unstyled-item app__nav__container__menu__item">
            <a href="https://www.icij.org/investigations/paradise-papers/" target="_blank">
              Paradise Papers
              <font-awesome-icon icon="external-link-alt" class="ml-1 app__nav__container__menu__item__new" />
            </a>
          </li>
          <li class="list-unstyled-item app__nav__container__menu__item">
            <a href="https://offshoreleaks.icij.org" target="_blank">
              Offshore Leaks
              <font-awesome-icon icon="external-link-alt" class="ml-1 app__nav__container__menu__item__new" />
            </a>
          </li>
          <li class="list-unstyled-item app__nav__container__menu__item">
            <a href="https://www.icij.org/" target="_blank">
              ICIJ
              <font-awesome-icon icon="external-link-alt" class="ml-1 app__nav__container__menu__item__new" />
            </a>
          </li>
        </ul>
      </div>
    </header>
  </headroom>
</template>

<script>
import { headroom } from 'vue-headroom'
import LanguageChooser from './LanguageChooser'

export default {
  name: 'AppNav',
  components: {
    headroom,
    LanguageChooser
  },
  data () {
    return {
      collapseMenu: true
    }
  },
  methods: {
    toggleMenu () {
      this.collapseMenu = !this.collapseMenu
    }
  }
}
</script>

<style lang="scss">
  .app__nav {
    z-index: $zindex-fixed;
    position: relative;
    width:100%;
    color:white;
    width: auto;
    min-height: $app-nav-height;
    background: darken(theme-color('icij'), 0);
    box-shadow: 0 0 5px rgba(black, 0.4);

    &--collapse, &--collapse &__container__main {
      transition: background 600ms, box-shadow 600ms;

      .headroom--top & {
        // box-shadow: 0 0 5px rgba(black, 0);

        &:before {
          @include media-breakpoint-down(md) {
            transform: translateX(-200%)
          }
        }
      }
    }

    &__mask {
      background: rgba(white, 0.5);
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
        background: theme-color('icij');
        min-height: $app-nav-height;

        &__brand, &__brand:hover, &__brand:focus {
          color: inherit;
          position: relative;
          display: inline-block;
          margin-left: $spacer;
          margin-top: $spacer;
          pointer-events: auto;

          &:before {
            content:"";
            background: url('~images/icij-white@2x.png') no-repeat 0 0;
            background-size: cover;
            width: $app-nav-brand-height;
            height: $app-nav-brand-height;
            display: inline-block;
            z-index: $zindex-fixed + 20;
            border:1px solid white;
          }

          & > * {
            font-size: 2rem;
            display: inline-block;
            line-height: $line-height-base;
          }
        }

        &__hamburger {
          cursor: pointer;
          color: inherit;
          pointer-events: auto;
        }
      }

      &__menu {
        z-index: $zindex-fixed + 20;
        position: absolute;
        top:100%;
        left:0;
        right:0;
        clear:both;
        margin:0;
        background: darken(theme-color('icij'), 10);
        transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);

        &:after {
          z-index:10;
          transition: opacity 400ms;
          position: absolute;
          top:100%;
          height: 3rem;
          left:0;
          right:0;
          content:"";
          pointer-events: none;
          @include gradient-y(rgba(black, 0.2), rgba(black, 0));
        }

        &--collapse,
        .headroom--unpinned & {
          transform: translateY(-100%);
          &:after {
            opacity: 0;
          }
        }

        &__item {
          border-bottom: 1px solid rgba(white, 0.1);

          & > a {
            display: block;
            padding: $spacer;
            color: white;

            &:hover {
              background: rgba(white, 0.1);
            }
          }

          &__new {
            color: rgba(white, 0.2);
          }
        }
      }
    }
  }
</style>
