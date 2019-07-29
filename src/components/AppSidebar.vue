<template>
  <div class="app-sidebar" :class="{ 'app-sidebar--reduced': reduced }">
    <vue-perfect-scrollbar class="app-sidebar__container">
      <div class="d-flex align-items-center justify-content-center">
        <router-link class="app-sidebar__container__brand align-items-center flex-grow-1" :to="{ name: 'landing' }">
          <img src="~images/logo-white.svg" alt="Datashare" class="app-sidebar__container__brand__logo" />
          <span class="app-sidebar__container__brand__beta">beta</span>
        </router-link>
        <div>
          <a @click="hideSidebar()" class="app-sidebar__container__toggler">
            <fa icon="arrow-left" />
          </a>
        </div>
      </div>

      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <router-link :to="{ name: 'landing' }" class="app-sidebar__container__menu__item__link" title="Search in documents" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="search" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              Search in documents
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <router-link :to="{ name: 'indexing' }" class="app-sidebar__container__menu__item__link" title="Analyze my documents" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="rocket" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              Analyze my documents
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <router-link :to="{ name: 'batch-search' }" class="app-sidebar__container__menu__item__link" title="Batch searches" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="layer-group" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              Batch searches
            </span>
          </router-link>
        </li>
        <li class="app-sidebar__container__menu__item">
          <a href="#" class="app-sidebar__container__menu__item__link" title="Your history" v-b-tooltip.right="{ customClass: tooltipsClass }" @click.prevent="$root.$emit('history::toggle')">
            <fa icon="clock" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              Your history
            </span>
          </a>
        </li>
      </ul>

      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <a href="" class="app-sidebar__container__menu__item__link" title="FAQ" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="question" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              FAQ
            </span>
          </a>
        </li>
        <li class="app-sidebar__container__menu__item">
          <a href="" class="app-sidebar__container__menu__item__link" title="Ask for help" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="ambulance" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              Ask for help
            </span>
          </a>
        </li>
      </ul>

      <ul class="app-sidebar__container__menu list-unstyled">
        <li class="app-sidebar__container__menu__item">
          <a href="" class="app-sidebar__container__menu__item__link" title="Logout" v-b-tooltip.right="{ customClass: tooltipsClass }">
            <fa icon="sign-out-alt" fixed-width />
            <span class="flex-grow-1 app-sidebar__container__menu__item__link__label">
              Logout
            </span>
          </a>
        </li>
      </ul>
    </vue-perfect-scrollbar>
  </div>
</template>

<script>
  import VuePerfectScrollbar from 'vue-perfect-scrollbar'

  export default {
    name: 'AppSidebar',
    components: {
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
      tooltipsClass () {
        return this.reduced ? '' : 'd-none'
      }
    }
  }
</script>

<style lang="scss">
  .app-sidebar {
    color: white;
    min-width: 60px;
    max-width: $app-sidebar-width;
    width: $app-sidebar-width;

    &--reduced {
      width: auto;
    }

    &__container {
      max-height: 100vh;

      &__brand, &__brand:hover, &__brand:focus, &__brand {
        color: inherit;
        padding: $spacer;
        pointer-events: auto;
        max-width: $aggregations-panel-width;
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

        &__item {
          font-size: 0.9rem;
          font-weight: bold;

          &__link {
            display: block;
            margin: $spacer * 0.5 $spacer;
            padding: $spacer * 0.75;
            color: rgba(white, 0.6);
            display: flex;

            &.router-link-exact-active, &:hover, &:active {
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
  }
</style>
