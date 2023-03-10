<script>
import { uniqueId } from 'lodash'

import { toVariant, toVariantIcon, toVariantColor } from '@/utils/utils'

/**
 * Draw a badge depending on the status with an ellipse progress diagram.
 */
export default {
  name: 'EllipseStatus',
  filters: {
    toVariant,
    toVariantIcon,
    toVariantColor
  },
  props: {
    /**
     * Status of the badge.
     */
    status: {
      type: String,
      default: 'warning'
    },
    /**
     * Progress percentage. If none is specificed while the status is
     * "running", the components passes to a "loading" state.
     */
    progress: {
      type: Number,
      default: null
    },
    /**
     * Dispaly the badge and the progress horizontaly.
     */
    horizontal: {
      type: Boolean
    },
    /**
     * Hide the badge (and show only the ellipse)
     */
    noBadge: {
      type: Boolean
    },
    /**
     * Default animation for "running" progress.
     */
    animation: {
      type: String,
      default: 'default 1000 0'
    },
    /**
     * Size of the ellipse progress.
     */
    ellipseSize: {
      type: Number,
      default: 25
    },
    /**
     * Thickness of the ellipse progress.
     */
    ellipseThickness: {
      type: Number,
      default: 2
    },
    /**
     * Font size of the legend in the ellipse progress.
     */
    ellipseSizeFontSize: {
      type: String,
      default: '0.5em'
    },
    /**
     * Size of the error modal. Can be:  'sm', 'md', 'lg' (default), or 'xl'.
     */
    errorModalSize: {
      type: String,
      default: 'lg',
      validator: (size) => ['sm', 'md', 'lg', 'xl'].includes(size)
    }
  },
  computed: {
    emptyColor() {
      const style = getComputedStyle(document.body)
      return style.getPropertyValue('--light') || '#eee'
    },
    statusAnimation() {
      if (this.statusAsVariant === 'info') {
        return this.animation
      }
      return 'default 0 0'
    },
    statusProgress() {
      if (this.statusAsVariant === 'info') {
        const rounded = Math.round(this.progress)
        return Math.max(Math.min(rounded, 100), 0)
      }
      return 100
    },
    statusProgressAsPercentage() {
      return `${this.statusProgress}%`
    },
    statusAsVariant() {
      return toVariant(this.status)
    },
    loading() {
      return this.statusAsVariant === 'info' && this.idle
    },
    idle() {
      return this.progress === null || this.progress <= 0 || this.progress >= 100
    },
    hasError() {
      return 'error' in this.$slots
    },
    errorModalId() {
      return uniqueId('ellipse-status-error-modal-')
    }
  }
}
</script>

<template>
  <span class="ellipse-status d-inline-flex align-items-center" :class="{ 'flex-column': !horizontal }">
    <vue-ellipse-progress
      class="ellipse-status__progress"
      :size="ellipseSize"
      :thickness="ellipseThickness"
      :empty-thickness="ellipseThickness"
      :font-size="ellipseSizeFontSize"
      :progress="statusProgress"
      :color="status | toVariantColor"
      :empty-color="emptyColor"
      :animation="statusAnimation"
      :loading="loading"
    >
      <slot>
        <template v-if="statusAsVariant === 'info'">
          {{ statusProgressAsPercentage }}
        </template>
        <template v-else>
          <fa
            class="ellipse-status__progress__icon"
            fixed-width
            :class="status | toVariant('dark', 'text-')"
            :icon="status | toVariantIcon"
          />
        </template>
      </slot>
    </vue-ellipse-progress>
    <span
      v-if="!noBadge"
      class="ellipse-status__badge mx-2 d-inline-flex"
      :class="{ 'ellipse-status__badge--has-error': hasError }"
    >
      <b-badge v-if="hasError" v-b-modal:[errorModalId] :variant="statusAsVariant" class="p-0">
        <span class="d-inline-block p-1">
          {{ status }}
        </span>
        <span
          class="ellipse-status__badge__toggler bg-white d-inline-block p-1"
          :class="status | toVariant('dark', 'text-')"
        >
          <fa icon="external-link-alt" />
        </span>
      </b-badge>
      <b-badge v-else :variant="statusAsVariant" class="p-1">
        {{ status }}
      </b-badge>
    </span>
    <b-modal :id="errorModalId" body-class="ellipse-status__modal pb-0" hide-header ok-only :size="errorModalSize">
      <slot name="error" />
    </b-modal>
  </span>
</template>

<style lang="scss">
.ellipse-status {
  &__progress {
    position: relative;

    &__icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(1.75);
    }
  }

  &__badge {
    &--has-error {
      cursor: pointer;
    }

    &__toggler {
      box-shadow: 0 0 0 1px currentColor inset;
      border-radius: inherit;
    }
  }
}
</style>
