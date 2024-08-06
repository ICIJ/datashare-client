<script setup>
import { useI18n } from 'vue-i18n'

import DisplayUser from '@/components/Display/DisplayUser.vue'
import DisplayDatetime from '@/components/Display/DisplayDatetime.vue'
import ButtonIcon from '@/components/Button/ButtonIcon.vue'

defineOptions({ name: 'DocumentUserCommentsListEntry' })
defineProps({
  username: { type: String, required: true },
  date: { type: Number, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true }
})
const { t } = useI18n()
const goToComment = t('documentUserCommentsListEntry.goToComment')
</script>

<template>
  <section class="document-user-comments-list-entry py-2">
    <div class="d-flex align-items-baseline">
      <display-user :value="username" />
      <display-datetime class="ms-auto text-body-tertiary" :value="date" />
      <button-icon variant="link" icon-left="arrowSquareOut" square hide-label :label="goToComment" />
      <!--      <button-icon variant="link" icon-left="arrowSquareOut" square hide-label label="Link to comment" :to="to" />-->
    </div>
    <article class="ps-4">{{ text }}</article>
  </section>
</template>
