<template>
  <widget-barometer
    class="widget-barometer-documents"
    :icon="IPhFiles"
  >
    <i18n-t
      keypath="widget.barometer.document"
      :plural="nbDocuments"
    >
      <template #n>
        <display-number-human
          v-if="nbDocuments !== null"
          :value="nbDocuments"
        />
        <span
          v-else
          class="text-secondary"
        >∞</span>
      </template>
    </i18n-t>
    <span
      v-if="nbDuplicates !== null"
      v-b-tooltip.body.top="{ delay: tooltipDelay }"
      class="widget-barometer-documents__duplicates ms-1"
      :title="duplicatesTitle"
    >
      <app-icon :name="IPhInfo" />
    </span>
    <template
      v-if="nbDocumentsOnDisks !== null"
      #label
    >
      <i18n-t
        keypath="widget.barometer.amongWhichOnDisk"
        :plural="nbDocumentsOnDisks"
      >
        <template #n>
          <display-number-human :value="nbDocumentsOnDisks" />
        </template>
      </i18n-t>
    </template>
  </widget-barometer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur-next'
import IPhFiles from '~icons/ph/files'
import IPhInfo from '~icons/ph/info'

import DisplayNumberHuman from '@/components/Display/DisplayNumberHuman'
import WidgetBarometer from '@/components/Widget/WidgetBarometer'
import humanNumber from '@/utils/humanNumber'

const props = defineProps({
  nbDocuments: {
    type: Number,
    default: 0
  },
  nbDocumentsOnDisks: {
    type: Number,
    default: 0
  },
  nbDuplicates: {
    type: Number,
    default: 0
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const { t, tm, n } = useI18n()

const duplicatesTitle = computed(() => {
  const count = props.nbDuplicates ?? 0
  return t('widget.barometer.duplicate', { n: humanNumber(count, tm('human.number'), n) }, count)
})
</script>
