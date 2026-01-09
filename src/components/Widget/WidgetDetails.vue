<script setup>
import { computed } from 'vue'
import { isFunction, kebabCase } from 'lodash'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur-next'

import IPhNotepad from '~icons/ph/notepad'
import IPhFolder from '~icons/ph/folder'
import IPhUserCircle from '~icons/ph/user-circle'
import IPhLink from '~icons/ph/link'
import IPhCalendarBlank from '~icons/ph/calendar-blank'
import IPhCalendarCheck from '~icons/ph/calendar-check'
import IPhInfo from '~icons/ph/info'

import DisplayRaw from '@/components/Display/DisplayRaw'
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import { useCore } from '@/composables/useCore'
import { useDataDir } from '@/composables/useDataDir'
import { useInsightsStore } from '@/store/modules'

defineProps({
  /**
   * The widget definition object.
   */
  widget: {
    type: Object
  }
})

const insightsStore = useInsightsStore()
const { getMountedPath } = useDataDir()

const fields = [
  {
    key: 'name',
    icon: IPhNotepad
  },
  {
    key: 'sourcePath',
    icon: IPhFolder,
    formatter: ({ rawValue }) => getMountedPath(rawValue?.split('//').pop())
  },
  {
    key: 'maintainerName',
    icon: IPhUserCircle
  },
  {
    key: 'publisherName',
    icon: IPhUserCircle
  },
  {
    key: 'sourceUrl',
    icon: IPhLink,
    href: ({ rawValue }) => rawValue,
    formatter: ({ rawValue }) => rawValue?.split('//').pop()
  },
  {
    key: 'creationDate',
    icon: IPhCalendarBlank,
    component: DisplayDatetime
  },
  {
    key: 'updateDate',
    icon: IPhCalendarCheck,
    component: DisplayDatetime
  }
]

const { t } = useI18n()
const core = useCore()

// Generate metadata for each field
const metadata = computed(() => {
  const project = core.findProject(insightsStore.project)
  return fields.map((field) => {
    const rawValue = project[field.key]
    const value = isFunction(field.formatter) ? field.formatter({ ...field, rawValue }) : rawValue
    const href = isFunction(field.href) ? field.href({ ...field, rawValue, value }) : null
    const label = t(`widget.project.fields.${field.key}`)
    const key = kebabCase(field.key)
    const component = field.component ?? DisplayRaw
    const icon = field.icon ?? IPhInfo
    return { ...field, key, label, href, rawValue, value, component, icon }
  })
})

// Filter out metadata with no value
const availableMetadata = computed(() => {
  return metadata.value.filter(({ value }) => !!value)
})
</script>

<template>
  <b-card
    class="widget-details border-0"
    body-class="p-4"
  >
    <div
      v-for="{ key, label, href, value, component, classList, icon } in availableMetadata"
      :key="key"
      class="widget-details__item"
    >
      <div class="row g-0">
        <div class="col-12 col-md-3 widget-details__item__label d-flex flex-truncate align-items-center">
          <app-icon
            v-if="icon"
            :name="icon"
            class="me-2 flex-shrink-0"
          />
          <span class="text-truncate">{{ label }}</span>
        </div>
        <div class="col widget-details__item__value ps-md-3 fw-medium">
          <a
            v-if="href"
            :href="href"
            class="text-truncate d-block"
          >
            <component
              :is="component"
              :value="value"
              :class="classList"
            />
          </a>
          <template v-else>
            <component
              :is="component"
              :value="value"
              :class="classList"
            />
          </template>
        </div>
      </div>
    </div>
  </b-card>
</template>

<style lang="scss" scope>
.widget-details {
  height: 100%;

  &__item {
    &:not(:last-of-type) {
      margin-bottom: $spacer-xs;
    }
  }
}
</style>
