<script setup>
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import ButtonIcon from '@/components/Button/ButtonIcon'

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
</script>

<template>
  <section class="document-user-comments-list-entry py-2">
    <div class="d-flex align-items-center text-nowrap">
      <slot name="header">
        <display-user :value="username" class="fw-bold text-body-emphasis" />
        <display-datetime class="ms-auto text-body-tertiary" :value="date" />
        <button-icon
          variant="link"
          icon-left="arrowSquareOut"
          hide-label
          hide-tooltip
          square
          target="_blank"
          :href="href"
          :label="$t('documentUserCommentsListEntry.goToComment')"
        />
      </slot>
    </div>
    <article class="ps-4">
      <slot name="text">
        {{ text }}
      </slot>
    </article>
  </section>
</template>
