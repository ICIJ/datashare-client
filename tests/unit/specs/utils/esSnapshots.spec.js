import { formatSnapshotName, parseSnapshotName } from '@/utils/esSnapshots'
import { ES_DISTRIBUTION } from '@/enums/esDistributions'

describe('esSnapshots utils', () => {
  describe('formatSnapshotName', () => {
    it('should generate a human-readable snapshot name', () => {
      const name = formatSnapshotName()
      expect(name).toMatch(/^[a-z]+-[a-z]+-[a-z]+$/)
    })

    it('should include version when provided', () => {
      const name = formatSnapshotName('8.11.1')
      expect(name).toMatch(/^[a-z]+-[a-z]+-[a-z]+-ver:8\.11\.1$/)
    })

    it('should include distribution and version when both provided', () => {
      const name = formatSnapshotName('2.11.0', 'opensearch')
      expect(name).toMatch(/^[a-z]+-[a-z]+-[a-z]+-dist:opensearch-ver:2\.11\.0$/)
    })

    it('should include only distribution when version is null', () => {
      const name = formatSnapshotName(null, 'opensearch')
      expect(name).toMatch(/^[a-z]+-[a-z]+-[a-z]+-dist:opensearch$/)
    })
  })

  describe('parseSnapshotName', () => {
    it('should parse snapshot name with version and distribution', () => {
      const result = parseSnapshotName('curious-green-fox-dist:opensearch-ver:2.11.0')
      expect(result).toEqual({
        name: 'curious-green-fox',
        version: '2.11.0',
        distribution: ES_DISTRIBUTION.OPENSEARCH
      })
    })

    it('should parse snapshot name with version only and default to elasticsearch', () => {
      const result = parseSnapshotName('curious-green-fox-ver:8.11.1')
      expect(result).toEqual({
        name: 'curious-green-fox',
        version: '8.11.1',
        distribution: ES_DISTRIBUTION.ELASTICSEARCH
      })
    })

    it('should parse snapshot name with distribution only', () => {
      const result = parseSnapshotName('curious-green-fox-dist:opensearch')
      expect(result).toEqual({
        name: 'curious-green-fox',
        version: null,
        distribution: ES_DISTRIBUTION.OPENSEARCH
      })
    })

    it('should parse snapshot name without version or distribution and default to elasticsearch', () => {
      const result = parseSnapshotName('curious-green-fox')
      expect(result).toEqual({
        name: 'curious-green-fox',
        version: null,
        distribution: ES_DISTRIBUTION.ELASTICSEARCH
      })
    })

    it('should handle null input', () => {
      const result = parseSnapshotName(null)
      expect(result).toEqual({
        name: null,
        version: null,
        distribution: ES_DISTRIBUTION.ELASTICSEARCH
      })
    })

    it('should handle empty string', () => {
      const result = parseSnapshotName('')
      expect(result).toEqual({
        name: null,
        version: null,
        distribution: ES_DISTRIBUTION.ELASTICSEARCH
      })
    })

    it('should handle complex version numbers', () => {
      const result = parseSnapshotName('happy-blue-cat-ver:8.11.1-SNAPSHOT')
      expect(result).toEqual({
        name: 'happy-blue-cat',
        version: '8.11.1-SNAPSHOT',
        distribution: ES_DISTRIBUTION.ELASTICSEARCH
      })
    })
  })
})
