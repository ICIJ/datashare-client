<script>
const instances = {}

export default {
  name: 'RouterLinkPopup',
  props: {
    to: {
      type: Object
    },
    target: {
      type: String,
      default: 'external'
    },
    features: {
      type: String,
      default () {
        const width = 880
        const height = window.outerHeight * 0.8
        const left = (screen.width / 2) - (width / 2)
        const top = (screen.height / 2) - (height / 2)
        return `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=no,status=1`
      }
    }
  },
  methods: {
    open () {
      instances[this.target] = window.open(this.href, this.target, this.features)
      if (instances[this.target]) {
        instances[this.target].focus()
      }
    }
  },
  computed: {
    href () {
      const { href } = this.$router.resolve(this.to)
      return href
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
