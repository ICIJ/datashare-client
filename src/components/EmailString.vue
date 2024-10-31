<script setup>
import { computed, useTemplateRef } from 'vue'
import { useStore } from 'vuex'
import { PhosphorIcon } from '@icij/murmur-next'
import trim from 'lodash/trim'

const EMAIL_REGEX = /(.+)\<(.+)\>/i

const props = defineProps({
  email: String,
  tag: {
    type: String,
    default: 'span'
  }
})

const elementRef = useTemplateRef('element')

const nameWithoutEmail = computed(() => {
  const matches = String(props.email).match(EMAIL_REGEX)
  return matches ? trim(matches[1], ' "\'`') : null
})

const emailWithoutName = computed(() => {
  const matches = String(props.email).match(EMAIL_REGEX)
  return matches ? trim(matches[2], ' "\'`') : null
})

const nameOrRawEmail = computed(() => {
  return nameWithoutEmail.value || props.email
})

const store = useStore()

const indices = computed(() => store.state.search.indices)

const qReceived = computed(() => {
  const field = 'metadata.tika_metadata_message_to'
  return `${field}:"${emailWithoutName.value || props.email}"`
})

const qSent = computed(() => {
  const field = 'metadata.tika_metadata_message_from'
  return `${field}:"${emailWithoutName.value || props.email}"`
})
</script>

<template>
  <component :is="tag" ref="element" class="email-string">
    {{ nameOrRawEmail }}
  </component>
  <b-popover :target="elementRef" custom-class="email-string__popover" placement="bottom">
    <div class="email-string__popover__content">
      <div class="h6 m-0">{{ nameWithoutEmail }}</div>
      <div class="mb-3">{{ emailWithoutName || email }}</div>
      <div class="d-flex flex-wrap gap-3">
        <router-link :to="{ name: 'search', query: { q: qReceived, indices } }" class="btn btn-action">
          <phosphor-icon name="tray-arrow-down" class="email-string__popover__content__icon" />
          {{ $t('email.receivedLink') }}
        </router-link>
        <router-link :to="{ name: 'search', query: { q: qSent, indices } }" class="btn btn-action">
          <phosphor-icon name="tray-arrow-up" class="email-string__popover__content__icon" />
          {{ $t('email.sentLink') }}
        </router-link>
      </div>
    </div>
  </b-popover>
</template>

<style lang="scss">
.email-string {
  display: inline-block;

  &__popover {
    min-width: 450px;
  }
}
</style>
