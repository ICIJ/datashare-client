<script>
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
import VueScrollTo from 'vue-scrollto'

/**
 * An contextual link to the "right" scroll position.
 */
export default {
  name: 'ScrollTracker',
  props: {
    /**
     * Hide the scroll tracker after this delay.
     */
    timeout: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      icon: faArrowUp,
      offset: 0,
      timeoutHolder: null,
      target: null,
      container: 'body',
      visible: false
    }
  },
  mounted() {
    // Listen to scroll request from the root
    this.$root.$on('scroll-tracker:request', this.request)
  },
  methods: {
    request(target, offset = 0, container = this.container) {
      this.target = target
      this.offset = offset
      this.container = container
      this.toggle(this.shouldBeVisible())
    },
    scrollToTarget() {
      this.hide()
      VueScrollTo.scrollTo(this.target, 200, { offset: this.offset, container: this.container })
    },
    toggle(toggler = !this.visible) {
      return toggler ? this.show() : this.hide()
    },
    show() {
      this.icon = this.isTargetAbove() ? faArrowDown : faArrowUp
      this.visible = true
      this.setTimeout()
      // Hide the tracker on scroll
      window.addEventListener('scroll', this.hide)
    },
    hide() {
      this.visible = false
      // Remove the event listener
      window.removeEventListener('scroll', this.hide)
    },
    setTimeout() {
      // Clear any existing timeout
      clearTimeout(this.timeoutHolder)
      // Hide the tracker after a delay
      this.timeoutHolder = setTimeout(() => {
        this.$nextTick(this.hide)
      }, this.timeout)
    },
    shouldBeVisible() {
      return !this.isTargetInView()
    },
    isTargetInView() {
      const { top } = this.targetBoundingClientRect()
      return top >= 0 && top < (window.innerHeight || document.documentElement.clientHeight)
    },
    isTargetAbove() {
      const { top } = this.targetBoundingClientRect()
      return top > (window.innerHeight || document.documentElement.clientHeight)
    },
    targetBoundingClientRect() {
      if (this.target.nodeType > 0) {
        return this.target.getBoundingClientRect()
      } else {
        return { top: this.target.y, left: this.target.x, bottom: 0, right: 0 }
      }
    }
  }
}
</script>

<template>
  <transition name="fade">
    <a class="scroll-tracker" tabindex="0" v-show="visible" @click="scrollToTarget">
      <fa :icon="icon"></fa>
    </a>
  </transition>
</template>

<style lang="scss" scoped>
$scroll-tracker-size: 8rem;

a.scroll-tracker {
  background: rgba(theme-color('dark'), 0.9);
  border-radius: $scroll-tracker-size * 0.1;
  bottom: 0;
  color: white;
  cursor: pointer;
  display: block;
  font-size: $scroll-tracker-size * 0.6;
  height: $scroll-tracker-size;
  left: 50%;
  line-height: $scroll-tracker-size;
  margin: $spacer 0;
  position: fixed;
  text-align: center;
  transform: translateX(-50%);
  width: $scroll-tracker-size;
  z-index: $zindex-tooltip;

  &:hover,
  &:active {
    background: theme-color('darker');
    color: white;
  }

  &.fade-enter-active,
  &.fade-leave-active {
    transition: 0.3s;
  }

  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;
  }
}
</style>
