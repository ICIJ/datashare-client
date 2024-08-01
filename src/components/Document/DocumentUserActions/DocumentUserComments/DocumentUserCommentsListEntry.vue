<script setup>
import DisplayUser from '@/components/Display/DisplayUser'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  username: { type: String, required: true },
  date: { type: Number, required: true },
  to: { type: String, required: true },
  text: { type: String, required: true }
})

const goToComment = 'Go to comment'
</script>

<template>
  <section class="py-2">
    <div class="d-flex">
      <display-user :value="username" />
      <display-datetime class="ms-auto" :value="date" />
      <button-icon variant="link" icon-left="arrowSquareOut" square hide-label :label="goToComment" />
      <!--      <button-icon variant="link" icon-left="arrowSquareOut" square hide-label label="Link to comment" :to="to" />-->
    </div>
    <article class="ps-4 text-justify">{{ text }}</article>
  </section>
</template>

<style scoped lang="scss"></style>
