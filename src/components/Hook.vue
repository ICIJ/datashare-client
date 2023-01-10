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
    }
  },
  render(createElement, context) {
    function filterHookedComponentsByTarget(targetName) {
      const { $store } = context.parent
      return $store.getters['hooks/filterHookedComponentsByTarget'](targetName)
    }

    function hookedComponents() {
      return filterHookedComponentsByTarget(context.props.name)
    }

    function renderedComponents() {
      return hookedComponents().map(({ component }) => {
        return createElement(component, { props: context.props.bind })
      })
    }

    function isDebug() {
      return context.parent.$config.is('hooksDebug')
    }

    function debugTag() {
      return createElement(context.props.debugTag, {
        class: ['hook-debug'],
        attrs: {
          'aria-hook': context.props.name,
          'aria-count': hookedComponents().length
        }
      })
    }

    function renderedComponentsWithDebug() {
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
