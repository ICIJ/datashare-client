<template>
  <div class="page-header">
    <div class="bg-white">
      <div class="container py-5">
        <div class="float-right">
          <slot></slot>
        </div>
        <h3 class="page-header__title">
          <page-icon v-if="icon" :icon="icon"></page-icon>
          <slot name="preTitle"></slot>
          {{ title }}
        </h3>
        <div class="page-header__description">
          <span v-html="description"></span>
        </div>
      </div>
    </div>
    <b-tabs v-if="hasTabs" v-model="tabIndex" class="page-header__tabs px-0" nav-wrapper-class="page-header__tabs__nav">
      <slot name="tabs" />
    </b-tabs>
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
      default: 'Description'
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
    }
  },
  computed: {
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
      background: $white;
      border-bottom: $border-color 1px solid;

      .nav-tabs {
        @include make-container();
        @each $breakpoint, $container-max-width in $container-max-widths {
          @include media-breakpoint-up($breakpoint, $grid-breakpoints) {
            max-width: $container-max-width;
          }
        }

        border: 0;
        padding: 0;

        .nav-link {
          font-size: 1rem;
          font-weight: bold;
          border-radius: 0;
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
            border-top: 2px solid $secondary;
            box-shadow: 0 0 10px 0 $secondary;
          }
        }
      }
    }
  }
}
</style>
