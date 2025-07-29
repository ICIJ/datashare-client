<template>
  <widget-barometer
    class="widget-barometer-documents"
    icon="files"
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
import DisplayNumberHuman from '@/components/Display/DisplayNumberHuman'
import WidgetBarometer from '@/components/Widget/WidgetBarometer'

defineProps({
  nbDocuments: {
    type: Number,
    default: 0
  },
  nbDocumentsOnDisks: {
    type: Number,
    default: 0
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})
</script>
