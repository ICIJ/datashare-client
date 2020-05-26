<script>
/**
 * Create a Hook slot. Hooks are registred on-the-fly by plugins to insert arbitrary components.
 */
export default {
  name: 'Hook',
  props: {
    /**
     * Name of the hook (targetted by plugins).
     */
    name: {
      type: String
    },
    /**
     * Specify the HTML tag to render instead of the default tag.
     */
    tag: {
      type: String,
      default: 'span'
    },
    /**
     * Properties to pass to each hooks.
     */
    bind: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    hookedComponents () {
      return this.$store.getters['hooks/filterHookedComponentsByTarget'](this.name)
    },
    isDebug () {
      return this.$config.is('hooksDebug')
    }
  }
}
</script>

<template>
  <component :is="tag" class="hook" :class="{ 'hook--debug': isDebug }" :aria-hook="name" :aria-count="hookedComponents.length">
    <component :is="hooked.component" v-bind="bind" v-for="(hooked, index) in hookedComponents" :key="index" />
  </component>
</template>

<style lang="scss">
  .hook {
    // Hides empty hook (excepted in debug mode)
    &:not(.hook--debug):empty {
      display: none;
    }

    &--debug:before {
      content: attr(aria-hook) " → " attr(aria-count);
      font-size: 0.8rem;
      font-weight: bold;
      color: $tertiary;
      text-shadow: 0 0 0.5em black;
      background: rgba(black, .7);
      font-family: $font-family-monospace;
      padding: 0.1em 0.3em;
    }
  }
</style>
