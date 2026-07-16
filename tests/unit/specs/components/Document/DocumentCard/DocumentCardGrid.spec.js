import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentCardGrid from '@/components/Document/DocumentCard/DocumentCardGrid'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'

describe('DocumentCardGrid.vue', () => {
  it('renders the thumbnail with lazy loading enabled', () => {
    const core = CoreSetup.init().useAll()
    const document = { id: 'doc-1', index: 'local-datashare', routing: 'doc-1', title: 'A document' }

    const wrapper = shallowMount(DocumentCardGrid, {
      global: { plugins: core.plugins },
      props: { document }
    })

    expect(wrapper.findComponent(DocumentThumbnail).props('lazy')).toBe(true)
  })
})
