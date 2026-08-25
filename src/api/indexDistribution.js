import { ES_DISTRIBUTION } from '@/enums/esDistributions'

let versionPromise = null

function fetchVersionOnce(api) {
  versionPromise ??= api.getVersion()
  return versionPromise
}

/**
 * Tells whether the backend index is an OpenSearch distribution, which has
 * no `_async_search` endpoint (icij/datashare#2349). The version is fetched
 * once and cached for the session.
 * @param {Object} api - The Datashare API instance
 * @returns {Promise<boolean>}
 */
export async function isOpenSearchDistribution(api) {
  try {
    const version = await fetchVersionOnce(api)
    return version['index.distribution'] === ES_DISTRIBUTION.OPENSEARCH
  }
  catch {
    // A failed version probe must not break search: fall back to the async
    // path and drop the cached promise so the next search retries the probe.
    versionPromise = null
    return false
  }
}

/**
 * Drops the cached version probe. Only meant for tests, which need a fresh
 * probe for each case.
 */
export function resetIndexDistribution() {
  versionPromise = null
}
