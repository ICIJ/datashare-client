<script>
const instances = {}

/**
 * A router-link that opens link in a popup.
 */
export default {
  name: 'RouterLinkPopup',
  props: {
    /**
     * The router-link `to` property: "denotes the target route of the link.
     * When clicked, the value of the to prop will be passed to router.push() internally, so the value can be either a string or a location descriptor object".
     */
    to: {
      type: [Object, String]
    },
    /**
     * A string specifying the name of the browsing context into which to load the specified resource.
     * If the name doesn't indicate an existing context, a new window is created and is given the name specified by windowName.
     */
    target: {
      type: String,
      default: 'external'
    },
    /**
     * A String containing a comma-separated list of window features given with their corresponding values in the form "name=value".
     * These features include options such as the window's default size and position, whether or not to include toolbar, and so forth.
     * There must be no whitespace in the string.
     */
    features: {
      type: String,
      default: null
    }
  },
  methods: {
    open() {
      instances[this.target] = window.open(this.href, this.target, this.features || this.defaultFeatures)
      if (instances[this.target]) {
        instances[this.target].focus()
      }
    }
  },
  computed: {
    href() {
      const { href } = this.$router.resolve(this.to)
      return href
    },
    defaultFeatures() {
      const width = 880
      const height = window.outerHeight * 0.8
      const left = screen.width / 2 - width / 2
      const top = screen.height / 2 - height / 2
      return `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`
    }
  }
}
</script>

<template>
  <a :href="href" @click.left.exact.prevent="open">
    <!-- @slot Main content of the link -->
    <slot>-</slot>
  </a>
</template>
