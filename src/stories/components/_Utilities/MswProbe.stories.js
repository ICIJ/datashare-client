import { defineComponent, ref, onMounted } from 'vue'

import { useCore } from '@/composables/useCore'
import { errorJson } from '../../../../.storybook/msw/helpers'

const MswProbe = defineComponent({
  name: 'MswProbe',
  setup() {
    const core = useCore()
    const tags = ref(null)
    const error = ref(null)
    onMounted(async () => {
      try {
        tags.value = await core.api.getTags('local-datashare', 'doc_01')
      }
      catch (e) {
        error.value = String(e?.message ?? e)
      }
    })
    return { tags, error }
  },
  template: `
    <div>
      <p v-if="error" data-testid="probe-error">Error: {{ error }}</p>
      <ul v-else-if="tags" data-testid="probe-tags">
        <li v-for="tag in tags" :key="tag.label">{{ tag.label }}</li>
      </ul>
      <p v-else>Loading…</p>
    </div>
  `
})

export default {
  title: 'Components/_Utilities/MswProbe',
  component: MswProbe,
  tags: ['autodocs']
}

export const Default = {}

export const Error = {
  parameters: {
    msw: { handlers: [errorJson('*/api/:project/documents/tags/:documentId')] }
  }
}
