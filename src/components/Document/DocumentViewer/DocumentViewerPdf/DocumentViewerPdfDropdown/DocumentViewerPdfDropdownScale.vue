<script setup>
import { computed, ref, watch } from 'vue'
import { matchesProperty } from 'lodash'
import { useI18n } from 'vue-i18n'
import { AppIcon } from '@icij/murmur-next'
import IPhMinus from '~icons/ph/minus'
import IPhPlus from '~icons/ph/plus'

import { SCALE_FIT, SCALE_WIDTH, SCALES } from '@/enums/documentViewerPdf'
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const modelValue = defineModel({ type: [String, Number], default: SCALE_FIT })
const numericScales = SCALES.filter(scale => typeof scale.value === 'number')

const { t } = useI18n()
const lastNumericValue = ref(1)
const lastNumericValueText = computed(() => numericScales.find(matchesProperty('value', lastNumericValue.value))?.text)

function zoomOut() {
  const currentIndex = numericScales.findIndex(matchesProperty('value', lastNumericValue.value))

  if (currentIndex > 0) {
    modelValue.value = numericScales[currentIndex - 1].value
  }
}

function zoomIn() {
  const currentIndex = numericScales.findIndex(matchesProperty('value', lastNumericValue.value))

  if (currentIndex < numericScales.length - 1) {
    modelValue.value = numericScales[currentIndex + 1].value
  }
}

watch(
  modelValue,
  (value) => {
    if (typeof value === 'number') {
      lastNumericValue.value = value
    }
  },
  { immediate: true }
)
</script>

<template>
  <b-dropdown-item-button
    :active="modelValue === SCALE_FIT"
    @click="modelValue = SCALE_FIT"
  >
    <span class="d-flex align-items-center gap-2">
      <app-icon><i-ph-arrows-in-line-horizontal /></app-icon>
      {{ t('documentViewerPdf.scale.fit') }}
    </span>
  </b-dropdown-item-button>
  <b-dropdown-item-button
    :active="modelValue === SCALE_WIDTH"
    @click="modelValue = SCALE_WIDTH"
  >
    <span class="d-flex align-items-center gap-2">
      <app-icon><i-ph-arrows-horizontal /></app-icon>
      {{ t('documentViewerPdf.scale.width') }}
    </span>
  </b-dropdown-item-button>
  <b-dropdown-text :text-class="{ active: typeof modelValue === 'number' }">
    <span class="d-flex align-items-center gap-2">
      <app-icon><i-ph-magnifying-glass /></app-icon>
      {{ t('documentViewerPdf.scale.zoom') }}
      <span class="ms-auto d-flex align-items-center gap-1">
        <button-row-action
          :icon-left="IPhMinus"
          :label="t('documentViewerPdf.scale.zoomOut')"
          @click="zoomOut()"
          @click.stop
        />
        {{ lastNumericValueText }}
        <button-row-action
          :icon-left="IPhPlus"
          :label="t('documentViewerPdf.scale.zoomOut')"
          @click="zoomIn()"
          @click.stop
        />
      </span>
    </span>
  </b-dropdown-text>
</template>
