<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  info: { type: String, default: '' },
  listLink: { type: String, default: '' },
  actionLink: { type: String, default: '' },
  actionText: { type: String, default: '' }
})
</script>

<template>
  <b-card no-body class="taskboard-entry border-0" style="max-width: 540px">
    <b-row no-gutters class="d-flex flex-grow-1">
      <b-col md="2">
        <div class="p-2">
          <phosphor-icon :name="icon" size="100%" class="text-action-emphasis bg-action-subtle" />
        </div>
      </b-col>
      <b-col md="10" class="d-flex">
        <b-card-body class="d-flex flex-column">
          <template #title
            ><h3 class="text-action-emphasis">{{ title }}</h3></template
          >
          <b-card-text class="d-flex flex-column flex-grow-1">
            <p>
              <slot name="description" v-bind="{ description }">{{ description }}</slot>
            </p>
            <span v-if="info" class="d-flex justify-content-end text-secondary-emphasis">
              <slot name="info" v-bind="{ info }">{{ info }}</slot>
            </span>
          </b-card-text>
          <b-card-text class="d-flex justify-content-between">
            <slot name="actions" v-bind="{ listLink, actionLink }">
              <button-icon icon-left="list" variant="outline-tertiary" :to="listLink">See all</button-icon>
              <button-icon v-if="actionLink" icon-left="plus" variant="outline-action" :to="actionLink">{{
                actionText
              }}</button-icon>
            </slot>
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<style scoped lang="scss"></style>
