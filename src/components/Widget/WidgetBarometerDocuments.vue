<template>
  <widget-barometer class="widget-barometer-documents" icon="files" :label="label">
    <i18n-t keypath="widget.barometer.document" :plural="nbDocuments">
      <template #n>
        <display-number-human :value="nbDocuments" :title="$n(nbDocuments)" v-b-tooltip />
      </template>
    </i18n-t>
    <template #label>
      <i18n-t keypath="widget.barometer.amongWhichOnDisk" :plural="nbDocumentsOnDisks">
        <template #n>
          <display-number-human :value="nbDocumentsOnDisks" :title="$n(nbDocumentsOnDisks)" v-b-tooltip />
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
  }
})
</script>
