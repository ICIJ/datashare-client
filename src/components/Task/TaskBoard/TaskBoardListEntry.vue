<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { useBreakpoints } from '@/composables/breakpoints'
import { SIZE } from '@/enums/sizes'

defineProps({
  title: { type: String, default: '' },
  icon: { type: String },
  description: { type: String, default: '' },
  info: { type: [String, Object] },
  listLink: { type: [String, Object] },
  actionLink: { type: [String, Object] },
  actionText: { type: String }
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[SIZE.XL]
})
</script>

<template>
  <b-card no-body class="task-board-list-entry border-0 p-4">
    <b-row class="d-flex flex-grow-1 g-3">
      <b-col md="2">
        <router-link :to="listLink" class="d-block">
          <phosphor-icon :name="icon" size="100%" class="task-board-list-entry__icon bg-action-subtle" />
        </router-link>
      </b-col>
      <b-col md="10" class="d-flex">
        <b-card-body class="d-flex flex-column overflow-auto p-0">
          <template #title>
            <h3 class="h4">
              <router-link :to="listLink">
                {{ title }}
              </router-link>
            </h3>
          </template>
          <b-card-text class="d-flex flex-column flex-grow-1">
            <slot name="description" v-bind="{ description }">
              <p>{{ description }}</p>
            </slot>
            <span class="d-flex justify-content-end text-secondary-emphasis">
              <slot name="info" v-bind="{ info }">
                <span class="task-board-list-entry__info">
                  <phosphor-icon :name="icon" />
                  {{ info }}
                </span>
              </slot>
            </span>
          </b-card-text>
          <b-card-text class="d-flex justify-content-between gap-2 flex-row row-wrap">
            <slot name="actions" v-bind="{ listLink, actionLink }">
              <button-icon icon-left="list" variant="outline-tertiary" :to="listLink" class="text-nowrap">
                {{ $t(`task.task-board.entries.seeAll`) }}
              </button-icon>
              <button-icon
                v-if="actionLink"
                :hide-label="compact"
                :label="actionText"
                icon-left="plus"
                variant="outline-action"
                :to="actionLink"
                :title="actionText"
              />
            </slot>
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<style scoped lang="scss">
.task-board-list-entry {
  &__icon {
    max-width: 8rem;
    width: 100%;
  }

  &__info {
    text-wrap: pretty;
  }
}
</style>
