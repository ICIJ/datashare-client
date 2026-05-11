<script setup>
import { ROLE } from '@/enums/roles.js'

import ProjectUsersList from '@/components/ProjectUsers/ProjectUsersList.vue'

// TODO: replace with real API call to fetch project users
const users = [
  { name: 'Alice Martin', role: ROLE.INSTANCE_ADMIN },
  { name: 'Bob Chen', role: ROLE.DOMAIN_ADMIN },
  { name: 'Carol Dupont', role: ROLE.PROJECT_ADMIN },
  { name: 'David Kim', role: ROLE.PROJECT_EDITOR },
  { name: 'Eva Schmidt', role: ROLE.PROJECT_MEMBER },
  { name: 'Frank Osei', role: ROLE.PROJECT_VISITOR }
]
</script>

<template>
  <div class="project-view-edit-users p-4">
    <project-users-list :users="users" />
  </div>
</template>
