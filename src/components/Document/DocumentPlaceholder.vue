<script setup>
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import DocumentContentPlaceholder from '@/components/Document/DocumentContentPlaceholder'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

const iconSize = '2.5rem'
</script>

<template>
  <div class="document-placeholder d-flex flex-column gap-3">
    <div class="d-flex gap-3 align-items-center">
      <div class="d-flex gap-1 bg-body-secondary p-1 rounded">
        <app-placeholder
          width="11.25rem"
          height="2.75rem"
        />
        <mode-server-only>
          <app-placeholder
            width="7rem"
            height="2.75rem"
          />
        </mode-server-only>
      </div>
      <div class="d-flex gap-3 ms-auto align-items-center">
        <app-placeholder
          :width="iconSize"
          :height="iconSize"
        />
        <app-placeholder
          :width="iconSize"
          :height="iconSize"
        />
        <app-placeholder
          :width="iconSize"
          :height="iconSize"
        />
        <app-placeholder
          :width="iconSize"
          :height="iconSize"
        />
        <app-placeholder
          :width="iconSize"
          :height="iconSize"
        />
        <app-placeholder
          width="5rem"
          height="3rem"
        />
      </div>
    </div>
    <h3 class="d-flex justify-content-between align-items-center">
      <app-placeholder :width="random(40, 60)" />
      <app-placeholder :width="15" />
    </h3>
    <tab-group-navigation>
      <tab-group-navigation-entry
        active
        @click.prevent
      >
        <app-placeholder
          width="5rem"
          :height="iconSize"
        />
      </tab-group-navigation-entry>
      <tab-group-navigation-entry @click.prevent>
        <app-placeholder
          width="4rem"
          :height="iconSize"
        />
      </tab-group-navigation-entry>
      <tab-group-navigation-entry @click.prevent>
        <app-placeholder
          width="6rem"
          :height="iconSize"
        />
      </tab-group-navigation-entry>
      <tab-group-navigation-entry @click.prevent>
        <app-placeholder
          width="5rem"
          :height="iconSize"
        />
      </tab-group-navigation-entry>
    </tab-group-navigation>
    <document-content-placeholder />
  </div>
</template>
