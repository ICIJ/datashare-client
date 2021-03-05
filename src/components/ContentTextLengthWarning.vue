<template>
  <div class="content-text-length-warning">
    <h4 class="content-text-length-warning__heading">
      {{ $t('contentTextLengthWarning.title') }}
    </h4>
    <div class="content-text-length-warning__body">
      <p v-html="$t('contentTextLengthWarning.description')"></p>
      <p v-html="$t('contentTextLengthWarning.download')"></p>
      <button class="content-text-length-warning__body__button btn bg-white text-dark" v-shortkey="['o']" @shortkey="ignoreContentTextLengthWarning" @click="ignoreContentTextLengthWarning">
        {{ $t('contentTextLengthWarning.open') }}
      </button>
    </div>
  </div>
</template>

<script>
/**
 * A simple block displaying a warning about the length of the text content.
 */
export default {
  name: 'ContentTextLengthWarning',
  methods: {
    ignoreContentTextLengthWarning () {
      this.$store.commit('document/ignoreContentTextLengthWarning')
      /**
       * Called when the user choose to ignore the warning
       */
      this.$emit('ignore')
    }
  }
}
</script>

<style lang="scss" scoped>
  .content-text-length-warning {
    margin: $spacer;
    padding: $spacer;
    @include gradient-y(mix($secondary, #fff, 5%), mix($secondary, #fff, 15%));
  }
</style>
