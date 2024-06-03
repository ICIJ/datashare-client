<script>
/**
 * Create a Hook slot. Hooks are registered on-the-fly by plugins to insert arbitrary components.
 */
export default {
  name: 'Hook',
  functional: true,
  props: {
    /**
     * Name of the hook (targeted by plugins).
     */
    name: {
      type: String
    },
    /**
     * Specify the HTML tag to render the debug tag instead of the default tag.
     */
    debugTag: {
      type: String,
      default: 'span'
    },
    /**
     * Properties to pass to each hooks.
     */
    bind: {
      type: Object,
      default: () => {}
    },
    /**
     * Pass along the class to the rendered node.
     */
    xClass: {
      type: String
    }
  },
  render(createElement) {
    const filterHookedComponentsByTarget = (targetName) => {
      return this.$store.getters['hooks/filterHookedComponentsByTarget'](targetName)
    }

    const hookedComponents = () => {
      return filterHookedComponentsByTarget(this.name)
    }

    const renderedComponents = () => {
      return hookedComponents().map(({ component }) => {
        return createElement(component, { props: this.bind, class: this.xClass })
      })
    }

    const isDebug = () => {
      return this.$config.is('hooksDebug')
    }

    const debugTag = () => {
      return createElement(this.debugTag, {
        class: ['hook-debug'],
        attrs: {
          'aria-hook': this.name,
          'aria-count': hookedComponents().length
        }
      })
    }

    const renderedComponentsWithDebug = () => {
      return [debugTag(), ...renderedComponents()]
    }

    // Add the debug tag only if debug mode is activated
    return isDebug() ? renderedComponentsWithDebug() : renderedComponents()
  }
}
</script>

<style lang="scss">
.hook-debug {
  position: relative;
  white-space: nowrap;
  height: 0;
  width: 0;

  &:before {
    content: attr(aria-hook) ' → ' attr(aria-count);
    font-size: 0.8rem;
    font-weight: bold;
    color: $tertiary;
    text-shadow: 0 0 0.5em black;
    background: rgba(black, 0.7);
    font-family: $font-family-monospace;
    padding: 0.1em 0.3em;
  }
}
</style>
