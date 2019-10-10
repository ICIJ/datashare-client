<template>
  <component :is="tag" class="email-string">
    <span>
      {{ nameOrRawEmail }}
      <b-popover :target="$el" triggers="hover focus" v-if="mounted" custom-class="email-string__popover" placement="bottom">
        <template #title>
          <div class="pt-2">{{ nameWithoutEmail }}</div>
          <div class="text-muted small font-weight-normal py-2">{{ emailWithoutName || email }}</div>
        </template>
        <div class="text-right email-string__popover__content">
          <router-link :to="{ name: 'search', query: { q: qReceived, index } }" class="btn btn-sm btn-primary">
            <fa mask="square" icon="arrow-down" transform="shrink-3 up-2" class="email-string__popover__content__icon" />
            {{ $t('email.receivedLink') }}
          </router-link>
          <router-link :to="{ name: 'search', query: { q: qSent, index } }" class="btn btn-sm btn-primary ml-1">
            <fa mask="square" icon="arrow-up" transform="shrink-3 down-2" class="email-string__popover__content__icon" />
            {{ $t('email.sentLink') }}
          </router-link>
        </div>
      </b-popover>
    </span>
  </component>
</template>

<script>
import trim from 'lodash/trim'

const EMAIL_REGEX = new RegExp('(.+)\<(.+)\>', 'i')

export default {
  name: 'EmailString',
  props: {
    email: {
      type: String
    },
    tag: {
      type: String,
      default: 'span'
    }
  },
  data () {
    return {
      mounted: false
    }
  },
  mounted () {
    this.mounted = true
  },
  computed: {
    nameOrRawEmail () {
      return this.nameWithoutEmail || this.email
    },
    nameWithoutEmail () {
      const matches = this.email.match(EMAIL_REGEX)
      return matches ? trim(matches[1]) : null
    },
    emailWithoutName () {
      const matches = this.email.match(EMAIL_REGEX)
      return matches ? trim(matches[2]) : null
    },
    index () {
      return this.$store.state.search.index
    },
    qReceived () {
      const field = 'metadata.tika_metadata_message_to'
      return `${field}:"${this.emailWithoutName || this.email}"`
    },
    qSent () {
      const field = 'metadata.tika_metadata_message_from'
      return `${field}:"${this.emailWithoutName || this.email}"`
    }
  }
}
</script>

<style lang="scss">
  .email-string {

    &__popover {

      &__content {
        min-width: 250px;
      }
    }
  }
</style>
