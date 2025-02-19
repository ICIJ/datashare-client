<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { useBreakpoints } from '@/composables/breakpoints'
import { SIZE } from '@/enums/sizes'

defineProps({
  title: { type: String, default: '' },
  icon: { type: String },
  description: { type: String, default: '' },
  info: { type: String },
  listLink: { type: String },
  actionLink: { type: String },
  actionText: { type: String }
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[SIZE.XL]
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
        <b-card-body class="d-flex flex-column overflow-auto">
          <template #title
            ><h3 class="text-action-emphasis">{{ title }}</h3></template
          >
          <b-card-text class="d-flex flex-column flex-grow-1">
            <p>
              <slot name="description" v-bind="{ description }">{{ description }}</slot>
            </p>
            <span v-if="info" class="d-flex justify-content-end text-secondary-emphasis">
              <slot name="info" v-bind="{ info }"
                ><span class="taskboard-entry__info"><phosphor-icon :name="icon" /> {{ info }}</span></slot
              >
            </span>
          </b-card-text>
          <b-card-text class="d-flex justify-content-between gap-2 flex-row row-wrap">
            <slot name="actions" v-bind="{ listLink, actionLink }">
              <button-icon icon-left="list" variant="outline-tertiary" :to="listLink" class="text-nowrap">{{
                $t(`task.taskboard.entries.seeAll`)
              }}</button-icon>
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
.taskboard-entry {
  &__info {
    text-wrap: pretty;
  }
}
</style>
