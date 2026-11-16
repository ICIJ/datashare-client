import CoreSetup from '~tests/unit/CoreSetup'
import { useDocumentPreview } from '@/composables/useDocumentPreview'

describe('useDocumentPreview', () => {
  it('builds the preview PDF URL', () => {
    const core = CoreSetup.init().useAll()
    core.config.set('previewHost', 'http://preview')
    const { getPdfUrl } = useDocumentPreview()
    const url = getPdfUrl({ index: 'local', id: 'doc', routing: 'root' })
    expect(url).toBe('http://preview/api/v1/pdf/local/doc?routing=root')
  })
})
