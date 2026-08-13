<script setup>
import { computed, ref } from 'vue'
import { AppIcon } from '@icij/murmur'
import trim from 'lodash/trim'
import { useI18n } from 'vue-i18n'

import { useSearchStore } from '@/store/modules'

const EMAIL_REGEX = /(.+)<(.+)>/i

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

// The target is a span or a strong rather than a button, so Enter and Space do
// not raise a click of their own. Popovers open on click only, which would
// leave this one unreachable by keyboard without an explicit toggle.
const isPopoverVisible = ref(false)
const togglePopover = () => (isPopoverVisible.value = !isPopoverVisible.value)

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
  <b-popover
    v-model="isPopoverVisible"
    teleport-to="body"
    class="display-email__popover"
    placement="bottom"
    :boundary-padding="16"
  >
    <template #target>
      <component
        :is="tag"
        class="display-email"
        role="button"
        tabindex="0"
        :aria-expanded="isPopoverVisible"
        @keydown.enter.prevent="togglePopover"
        @keydown.space.prevent="togglePopover"
      >
        {{ nameOrRawEmail }}
      </component>
    </template>
    <div class="display-email__popover__content">
      <div class="h6 m-0">
        {{ nameWithoutEmail }}
      </div>
      <div class="mb-3">
        {{ emailWithoutName || value }}
      </div>
      <div class="d-flex flex-wrap gap-3">
        <router-link
          :to="{ name: 'search', query: { q: qReceived, indices } }"
          class="btn btn-action"
        >
          <app-icon class="display-email__popover__content__icon">
            <i-ph-tray-arrow-down />
          </app-icon>
          {{ t('displayEmail.receivedLink') }}
        </router-link>
        <router-link
          :to="{ name: 'search', query: { q: qSent, indices } }"
          class="btn btn-action"
        >
          <app-icon class="display-email__popover__content__icon">
            <i-ph-tray-arrow-up />
          </app-icon>
          {{ t('displayEmail.sentLink') }}
        </router-link>
      </div>
    </div>
  </b-popover>
</template>

<style lang="scss">
.display-email {
  display: inline-block;
  cursor: pointer;

  &__popover {
    min-width: 450px;
  }
}
</style>
