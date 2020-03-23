<script>
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
import VueScrollTo from 'vue-scrollto'

export default {
  name: 'ScrollTracker',
  props: {
    timeout: {
      type: Number,
      default: 3000
    }
  },
  data () {
    return {
      icon: faArrowUp,
      offset: 0,
      timeoutHolder: null,
      target: null,
      container: 'body',
      visible: false
    }
  },
  mounted () {
    // Listen to scroll request from the root
    this.$root.$on('scroll-tracker:request', this.request)
  },
  methods: {
    request (target, offset = 0, container = this.container) {
      this.target = target
      this.offset = offset
      this.container = container
      this.toggle(this.shouldBeVisible())
    },
    scrollToTarget () {
      this.hide()
      VueScrollTo.scrollTo(this.target, 200, { offset: this.offset, container: this.container })
    },
    toggle (toggler = !this.visible) {
      return toggler ? this.show() : this.hide()
    },
    show () {
      this.icon = this.isTargetAbove() ? faArrowDown : faArrowUp
      this.visible = true
      this.setTimeout()
      // Hide the tracker on scroll
      window.addEventListener('scroll', this.hide)
    },
    hide () {
      this.visible = false
      // Remove the event listener
      window.removeEventListener('scroll', this.hide)
    },
    setTimeout () {
      // Clear any existing timeout
      clearTimeout(this.timeoutHolder)
      // Hide the tracker after a delay
      this.timeoutHolder = setTimeout(() => { this.$nextTick(this.hide) }, this.timeout)
    },
    shouldBeVisible () {
      return !this.isTargetInView()
    },
    isTargetInView () {
      const { top } = this.targetBoundingClientRect()
      return top >= 0 && top < (window.innerHeight || document.documentElement.clientHeight)
    },
    isTargetAbove () {
      const { top } = this.targetBoundingClientRect()
      return top > (window.innerHeight || document.documentElement.clientHeight)
    },
    targetBoundingClientRect () {
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
      <fa :icon="icon" />
    </a>
  </transition>
</template>

<style lang="scss">
  $scroll-tracker-size: 8rem;

  a.scroll-tracker {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    margin: $spacer 0;
    z-index: $zindex-tooltip;
    display: block;
    width: $scroll-tracker-size;
    height: $scroll-tracker-size;
    line-height: $scroll-tracker-size;
    font-size: $scroll-tracker-size * 0.6;
    text-align: center;
    background: rgba(theme-color('dark'), 0.9);
    color: white;
    border-radius: $scroll-tracker-size * 0.1;
    cursor: pointer;

    &:hover, &:active {
      color: white;
      background: theme-color('darker');
    }

    &.fade-enter-active, &.fade-leave-active {
      transition: .3s;
    }

    &.fade-enter, &.fade-leave-to {
      opacity: 0;
    }
  }
</style>
