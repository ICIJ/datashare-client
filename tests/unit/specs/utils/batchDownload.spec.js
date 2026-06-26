import {
  hasBatchDownloadResult,
  batchDownloadFileExists,
  isBatchDownloadAvailable,
  isBatchDownloadMissing
} from '@/utils/batchDownload'

function item({ uri = 'file:///tmp/archive.zip', exists } = {}) {
  const batchDownload = {}
  if (exists !== undefined) {
    batchDownload.exists = exists
  }
  return {
    result: uri ? { value: { uri } } : undefined,
    args: { batchDownload }
  }
}

describe('utils/batchDownload', () => {
  describe('hasBatchDownloadResult', () => {
    it('is true when a result uri is present', () => {
      expect(hasBatchDownloadResult(item({ uri: 'file:///a.zip' }))).toBe(true)
    })

    it('is false when there is no result', () => {
      expect(hasBatchDownloadResult(item({ uri: null }))).toBe(false)
    })
  })

  describe('batchDownloadFileExists', () => {
    it('is true when exists is true', () => {
      expect(batchDownloadFileExists(item({ exists: true }))).toBe(true)
    })

    it('is true when exists is absent (backward compatible)', () => {
      expect(batchDownloadFileExists(item())).toBe(true)
    })

    it('is false only on a strict false', () => {
      expect(batchDownloadFileExists(item({ exists: false }))).toBe(false)
    })

    it('treats a non-boolean falsy exists as present', () => {
      expect(batchDownloadFileExists(item({ exists: null }))).toBe(true)
    })
  })

  describe('isBatchDownloadAvailable', () => {
    it('is true with a result and an existing file', () => {
      expect(isBatchDownloadAvailable(item({ exists: true }))).toBe(true)
    })

    it('is false when the file is gone', () => {
      expect(isBatchDownloadAvailable(item({ exists: false }))).toBe(false)
    })

    it('is false when there is no result', () => {
      expect(isBatchDownloadAvailable(item({ uri: null, exists: true }))).toBe(false)
    })
  })

  describe('isBatchDownloadMissing', () => {
    it('is true when a produced file is now gone', () => {
      expect(isBatchDownloadMissing(item({ exists: false }))).toBe(true)
    })

    it('is false when the file still exists', () => {
      expect(isBatchDownloadMissing(item({ exists: true }))).toBe(false)
    })

    it('is false when there was never a result (never available)', () => {
      expect(isBatchDownloadMissing(item({ uri: null, exists: false }))).toBe(false)
    })
  })
})
