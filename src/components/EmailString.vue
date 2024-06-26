<template>
  <component :is="tag" class="email-string">
    <span>
      {{ nameOrRawEmail }}
      <b-popover
        v-if="mounted"
        :target="$el"
        triggers="hover focus"
        custom-class="email-string__popover"
        placement="bottom"
      >
        <template #title>
          <div class="pt-2">{{ nameWithoutEmail }}</div>
          <div class="text-muted small fw-normal py-2">{{ emailWithoutName || email }}</div>
        </template>
        <div class="text-end email-string__popover__content">
          <router-link :to="{ name: 'search', query: { q: qReceived, indices } }" class="btn btn-sm btn-primary">
            <fa
              mask="square"
              icon="arrow-down"
              transform="shrink-3 up-2"
              class="email-string__popover__content__icon"
            ></fa>
            {{ $t('email.receivedLink') }}
          </router-link>
          <router-link :to="{ name: 'search', query: { q: qSent, indices } }" class="btn btn-sm btn-primary ms-1">
            <fa
              mask="square"
              icon="arrow-up"
              transform="shrink-3 down-2"
              class="email-string__popover__content__icon"
            ></fa>
            {{ $t('email.sentLink') }}
          </router-link>
        </div>
      </b-popover>
    </span>
  </component>
</template>

<script>
import trim from 'lodash/trim'

const EMAIL_REGEX = /(.+)\<(.+)\>/i

/**
 * Rich email display with shortcuts to the global search.
 */
export default {
  name: 'EmailString',
  props: {
    /**
     * Email to display.
     */
    email: {
      type: String
    },
    /**
     * Specify the HTML tag to render instead of the default tag.
     */
    tag: {
      type: String,
      default: 'span'
    }
  },
  data() {
    return {
      mounted: false
    }
  },
  computed: {
    nameOrRawEmail() {
      return this.nameWithoutEmail || this.email
    },
    nameWithoutEmail() {
      const matches = String(this.email).match(EMAIL_REGEX)
      return matches ? trim(matches[1]) : null
    },
    emailWithoutName() {
      const matches = String(this.email).match(EMAIL_REGEX)
      return matches ? trim(matches[2]) : null
    },
    indices() {
      return this.$store.state.search.indices
    },
    qReceived() {
      const field = 'metadata.tika_metadata_message_to'
      return `${field}:"${this.emailWithoutName || this.email}"`
    },
    qSent() {
      const field = 'metadata.tika_metadata_message_from'
      return `${field}:"${this.emailWithoutName || this.email}"`
    }
  },
  mounted() {
    this.mounted = true
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
