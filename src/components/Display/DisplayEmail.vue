<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import trim from 'lodash/trim'
import { useI18n } from 'vue-i18n'

import { useSearchStore } from '@/store/modules'

const EMAIL_REGEX = /(.+)\<(.+)\>/i

const props = defineProps({
  value: {
    type: String
  },
  tag: {
    type: String,
    default: 'span'
  }
})
const { t } = useI18n()

const nameWithoutEmail = computed(() => {
  const matches = String(props.value).match(EMAIL_REGEX)
  return matches ? trim(matches[1], ' "\'`') : null
})

const emailWithoutName = computed(() => {
  const matches = String(props.value).match(EMAIL_REGEX)
  return matches ? trim(matches[2], ' "\'`') : null
})

const nameOrRawEmail = computed(() => {
  return nameWithoutEmail.value || props.value
})

const searchStore = useSearchStore.inject()

const indices = computed(() => searchStore.indices)

const qReceived = computed(() => {
  const field = 'metadata.tika_metadata_message_to'
  return `${field}:"${emailWithoutName.value || props.value}"`
})

const qSent = computed(() => {
  const field = 'metadata.tika_metadata_message_from'
  return `${field}:"${emailWithoutName.value || props.value}"`
})
</script>

<template>
  <b-popover teleport-to="body" class="display-email__popover" placement="bottom" :boundary-padding="16">
    <template #target>
      <component :is="tag" class="display-email">
        {{ nameOrRawEmail }}
      </component>
    </template>
    <div class="display-email__popover__content">
      <div class="h6 m-0">{{ nameWithoutEmail }}</div>
      <div class="mb-3">{{ emailWithoutName || value }}</div>
      <div class="d-flex flex-wrap gap-3">
        <router-link :to="{ name: 'search', query: { q: qReceived, indices } }" class="btn btn-action">
          <phosphor-icon :name="PhTrayArrowDown" class="display-email__popover__content__icon" />
          {{ t('displayEmail.receivedLink') }}
        </router-link>
        <router-link :to="{ name: 'search', query: { q: qSent, indices } }" class="btn btn-action">
          <phosphor-icon :name="PhTrayArrowUp" class="display-email__popover__content__icon" />
          {{ t('displayEmail.sentLink') }}
        </router-link>
      </div>
    </div>
  </b-popover>
</template>

<style lang="scss">
.display-email {
  display: inline-block;

  &__popover {
    min-width: 450px;
  }
}
</style>
