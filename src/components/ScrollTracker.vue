<script>
import { toValue, markRaw } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

/**
 * An contextual link to the "right" scroll position.
 */
export default {
  name: 'ScrollTracker',
  components: {
    PhosphorIcon
  },
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
      icon: markRaw(PhArrowFatUp),
      timeoutHolder: null,
      target: null,
      visible: false
    }
  },
  mounted() {
    // Listen to scroll request from the root
    this.$core.on('scroll-tracker:request', this.request)
  },
  methods: {
    request({ element } = {}) {
      this.target = toValue(element)?.$el ?? toValue(element)
      this.toggle(this.shouldBeVisible())
    },
    scrollToTarget() {
      this.hide()
      this.target?.scrollIntoView?.({ block: 'start', inline: 'nearest', behavior: 'auto' })
    },
    toggle(toggler = !this.visible) {
      return toggler ? this.show() : this.hide()
    },
    show() {
      this.icon = markRaw(this.isTargetAbove() ? PhArrowFatDown : PhArrowFatUp)
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
      if (!this.target) {
        return { top: 0, left: 0, bottom: 0, right: 0 }
      }
      if (this.target.nodeType > 0) {
        return this.target.getBoundingClientRect()
      }
      return { top: this.target.y, left: this.target.x, bottom: 0, right: 0 }
    }
  }
}
</script>

<template>
  <transition name="fade">
    <a v-show="visible" class="scroll-tracker" tabindex="0" @click="scrollToTarget">
      <phosphor-icon :name="icon" weight="fill" />
    </a>
  </transition>
</template>

<style lang="scss" scoped>
$scroll-tracker-size: 8rem;

a.scroll-tracker {
  background: rgba($dark, 0.9);
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
    background: $darker;
    color: white;
  }
}
</style>
