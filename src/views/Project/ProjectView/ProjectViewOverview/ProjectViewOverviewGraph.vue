<script setup>
import ProjectViewOverviewWidgets from './ProjectViewOverviewWidgets'

import projectsGraphEmpty from '@/assets/images/illustrations/projects-graph-empty-light.svg'
import projectsGraphEmptyDark from '@/assets/images/illustrations/projects-graph-empty-dark.svg'
import EmptyState from '@/components/EmptyState/EmptyState'

defineProps({
  name: {
    type: String
  }
})
</script>

<template>
  <div class="project-view-overview-graph">
    <project-view-overview-widgets :name="name" section="graph">
      <template #empty>
        <empty-state
          image-max-width="265px"
          :image="projectsGraphEmpty"
          :image-dark="projectsGraphEmptyDark"
          :action-label="$t('projectViewOverviewGraph.emptyStateAction')"
          :action-to="{ name: 'settings.extensions' }"
        >
          <template #label>
            <i18n-t keypath="projectViewOverviewGraph.emptyStateLabel" /><br />
            <i18n-t keypath="projectViewOverviewGraph.emptyStateLabelWithLink">
              <template #articleLink>
                <i18n-t
                  keypath="projectViewOverviewGraph.emptyStateLabelArticleLink"
                  tag="a"
                  href="https://www.icij.org/inside-icij/2024/02/datashares-new-plug-in-helps-investigative-journalists-connect-the-dots-with-graphs/"
                  target="_blank"
                />
              </template>
            </i18n-t>
          </template>
        </empty-state>
      </template>
    </project-view-overview-widgets>
  </div>
</template>
