<script setup>
// Ensure retro-compatibility with plugins
import { defineComponent } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'

// Re-export the ButtonIcon component. If not using script setup, storybook doc gen will fail during build.
defineComponent(ButtonIcon)
</script>
