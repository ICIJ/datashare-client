<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import DisplayUser from '@/components/Display/DisplayUser'
import DisplayUserAvatar from '@/components/Display/DisplayUserAvatar'
import DisplayDatetime from '@/components/Display/DisplayDatetime'

defineOptions({ name: 'DocumentUserCommentsListEntry' })

defineProps({
  username: {
    type: String,
    required: true
  },
  date: {
    type: Number,
    required: true
  },
  href: {
    type: String
  },
  text: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
</script>

<template>
  <section class="document-user-comments-list-entry py-2">
    <div class="d-flex align-items-center text-nowrap gap-2">
      <slot name="avatar">
        <display-user-avatar :value="username" height="38px" />
      </slot>
      <slot name="header">
        <display-user :value="username" class="fw-bold text-body-emphasis" hide-avatar />
      </slot>
      <slot name="date">
        <display-datetime class="ms-auto text-body-tertiary" :value="date" />
      </slot>
      <slot name="link">
        <button-icon
          class="px-1"
          variant="link"
          icon-left="arrowSquareOut"
          hide-label
          hide-tooltip
          target="_blank"
          :href="href"
          :label="t('documentUserCommentsListEntry.goToComment')"
        />
      </slot>
    </div>
    <article class="document-user-comments-list-entry__text">
      <slot name="text">
        {{ text }}
      </slot>
    </article>
  </section>
</template>

<style scoped>
.document-user-comments-list-entry__text {
  margin-left: calc(38px + 0.5rem);
}
</style>
