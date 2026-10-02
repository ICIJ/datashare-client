import { ref } from 'vue'

import { useStructureArtifact } from '@/composables/useStructureArtifact'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getStructureManifest: vi.fn()
    }
  }
})

describe('useStructureArtifact', () => {
  const document = { index: 'foo', id: 'doc-id', routing: 'root-id' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('probes the manifest of the given document', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
    const { fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(api.getStructureManifest).toBeCalledWith('foo', 'doc-id', 'root-id')
  })

  it('has markdown when the manifest advertises md pages', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md', 'xhtml'] })
    const { hasMarkdown, pages, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(true)
    expect(pages.value).toBe(3)
  })

  it('has no markdown before the probe resolves', () => {
    const { hasMarkdown, pages } = useStructureArtifact(document)
    expect(hasMarkdown.value).toBe(false)
    expect(pages.value).toBe(0)
  })

  it('has no markdown when the probe fails closed', async () => {
    api.getStructureManifest.mockResolvedValue(null)
    const { hasMarkdown, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(false)
  })

  it('has no markdown when the md format is missing', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['xhtml'] })
    const { hasMarkdown, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(false)
  })

  it('has no markdown when the manifest has zero pages', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 0, formats: ['md'] })
    const { hasMarkdown, fetchManifest } = useStructureArtifact(document)
    await fetchManifest()
    expect(hasMarkdown.value).toBe(false)
  })

  it('ignores a manifest that describes another document', async () => {
    api.getStructureManifest.mockResolvedValue({ pages: 3, formats: ['md'] })
    const documentRef = ref(document)
    const { hasMarkdown, fetchManifest } = useStructureArtifact(documentRef)
    await fetchManifest()
    documentRef.value = { index: 'foo', id: 'other-id', routing: 'other-id' }
    expect(hasMarkdown.value).toBe(false)
  })

  it('does not probe without a document id', async () => {
    const { fetchManifest } = useStructureArtifact({ index: 'foo' })
    await fetchManifest()
    expect(api.getStructureManifest).not.toBeCalled()
  })
})
