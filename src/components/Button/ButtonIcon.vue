<script>
import { ButtonIcon } from '@icij/murmur-next'
// This export is necessary to ensure that the ButtonIcon component is properly registered
// and available for use in Datashare's plugins. As you can see, we export a copy of the ButtonIcon component
// to avoid conflicts with the vue-docgen-plugin used by Storybook.
export default { ...ButtonIcon }
</script>
