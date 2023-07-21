<template>
  <div class="page-header">
    <div :class="classList">
      <div class="py-5">
        <div class="float-right">
          <slot></slot>
        </div>
        <div class="d-flex align-items-center">
          <slot name="preTitle">
            <page-icon v-if="icon" :icon="icon" class="mr-3" />
          </slot>
          <div class="">
            <h3 class="page-header__title d-flex align-items-center m-0">
              {{ title }}
            </h3>
            <div v-if="description" class="page-header__description text-muted" v-html="description"></div>
          </div>
        </div>
      </div>
      <b-tabs v-model="tabIndex" class="page-header__tabs px-0" nav-wrapper-class="page-header__tabs__nav">
        <slot name="tabs" :tab-index="tabIndex" />
      </b-tabs>
    </div>
  </div>
</template>

<script>
import PageIcon from '@/components/PageIcon'

/**
 * The header to display on top of every page
 */
export default {
  name: 'PageHeader',
  components: {
    PageIcon
  },
  props: {
    /**
     * The description of the page as subtitle
     */
    description: {
      type: String,
      default: null
    },
    /**
     * A FortAwesome definition object
     */
    icon: {
      type: String,
      default: null
    },
    /**
     * The title of the page
     */
    title: {
      type: String,
      default: 'Title'
    },
    /**
     * Index of the active tab
     */
    tab: {
      type: Number,
      default: 0
    },
    /**
     * Use fluid container
     */
    containerFluid: {
      type: Boolean
    }
  },
  computed: {
    classList() {
      return this.containerFluid ? ['container-fluid'] : ['container']
    },
    hasTabs() {
      return this.$slots.tabs
    },
    tabIndex: {
      set(value) {
        /**
         * Called when more directories are loaded
         */
        this.$emit('update:tab', value)
      },
      get() {
        return this.tab
      }
    }
  }
}
</script>

<style lang="scss">
.page-header {

  &__tabs {
    &__nav {
      position: relative;

      &:before {
        content: '';
        background: white;
        position: absolute;
        left: -50vw;
        right: -50vw;
        top: -50vh;
        bottom: -1px;
        display: block;
        border-bottom: $border-color 1px solid;
        z-index: -1;
      }


      .nav-tabs {
        border: 0;
        padding: 0;

        .nav-link {
          font-size: 1rem;
          font-weight: bold;
          border-radius: $border-radius $border-radius 0 0;
          border-bottom: 0;
          border-top: 0;

          &:hover:not(.active) {
            border-color: transparent;
          }
        }

        .nav-link.active {
          background: $body-bg;
          color: $dark;
          position: relative;
          overflow: hidden;
          text-shadow: 0 -2px 2px $body-bg;

          &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: $secondary;
            height: 2px;
            box-shadow: 0 0 10px 0 $secondary;
            border-radius: $border-radius $border-radius 0 0;
          }
        }
      }
    }
  }
}
</style>
