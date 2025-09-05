<script setup>
import { random } from 'lodash'

import AppPlaceholder from '@/components/AppPlaceholder/AppPlaceholder'
import DocumentContentPlaceholder from '@/components/Document/DocumentContentPlaceholder'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
</script>

<template>
  <div class="document-placeholder d-flex flex-column gap-3">
    <div class="d-flex gap-3 align-items-center">
      <div class="d-flex gap-1 bg-body-secondary p-1 rounded">
        <app-placeholder
          width="5rem"
          height="2.75rem"
        />
        <mode-server-only>
          <app-placeholder
            width="7rem"
            height="2.75rem"
          />
        </mode-server-only>
      </div>
      <div class="d-flex gap-2 ms-auto">
        <app-placeholder
          width="1.5rem"
          height="1.5rem"
        />
        <app-placeholder
          width="1.5rem"
          height="1.5rem"
        />
        <app-placeholder
          width="1.5rem"
          height="1.5rem"
        />
        <app-placeholder
          width="1.5rem"
          height="1.5rem"
        />
      </div>
    </div>
    <h3>
      <app-placeholder :width="random(40, 60)" />
    </h3>
    <tab-group-navigation>
      <tab-group-navigation-entry
        active
        @click.prevent
      >
        <app-placeholder
          width="5rem"
          height="1.5rem"
        />
      </tab-group-navigation-entry>
      <tab-group-navigation-entry @click.prevent>
        <app-placeholder
          width="4rem"
          height="1.5rem"
        />
      </tab-group-navigation-entry>
      <tab-group-navigation-entry @click.prevent>
        <app-placeholder
          width="6rem"
          height="1.5rem"
        />
      </tab-group-navigation-entry>
      <tab-group-navigation-entry @click.prevent>
        <app-placeholder
          width="5rem"
          height="1.5rem"
        />
      </tab-group-navigation-entry>
    </tab-group-navigation>
    <document-content-placeholder />
  </div>
</template>
