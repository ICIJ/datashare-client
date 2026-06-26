import get from 'lodash/get'

/**
 * Whether a batch-download task produced a downloadable result (i.e. it
 * completed and recorded a result URI).
 * @param {object} item - a batch-download task item
 * @returns {boolean}
 */
export function hasBatchDownloadResult(item) {
  return !!get(item, 'result.value.uri', false)
}

/**
 * Whether the batch-download's zip file still exists on disk. The backend
 * signals deletion with a strict `false`; the field defaults to `true` when
 * absent (older backends) so behaviour is backward compatible.
 * @param {object} item - a batch-download task item
 * @returns {boolean}
 */
export function batchDownloadFileExists(item) {
  return get(item, 'args.batchDownload.exists', true) !== false
}

/**
 * Whether the batch-download can be downloaded right now: it produced a result
 * and that file is still on disk.
 * @param {object} item - a batch-download task item
 * @returns {boolean}
 */
export function isBatchDownloadAvailable(item) {
  return hasBatchDownloadResult(item) && batchDownloadFileExists(item)
}

/**
 * Whether the batch-download was available but its file is now gone — the
 * "no longer available" case. Distinct from "never produced a file".
 * @param {object} item - a batch-download task item
 * @returns {boolean}
 */
export function isBatchDownloadMissing(item) {
  return hasBatchDownloadResult(item) && !batchDownloadFileExists(item)
}
