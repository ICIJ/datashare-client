import { useOnce } from '@/composables/useOnce'
import { ES_DISTRIBUTION, esDistributionValidator } from '@/enums/esDistributions'

const PROBE_TIMEOUT = 2000

export class InconclusiveDistributionError extends Error {
  constructor(distribution, options) {
    super(`inconclusive index distribution "${distribution}"`, options)
    this.name = 'InconclusiveDistributionError'
    this.distribution = distribution
  }
}

// Only a conclusive verdict may be cached for the session: the backend answers
// "unknown" when its own index probe fails (RootResource), and memoizing that
// would pin an OpenSearch deployment to the broken async path until reload.
// Throwing makes useOnce retry the probe on the next search.
const { run: probeDistribution } = useOnce(async (api) => {
  const version = await api.getVersionSilently({ timeout: PROBE_TIMEOUT })
  const distribution = version?.['index.distribution']
  if (!esDistributionValidator(distribution)) {
    throw new InconclusiveDistributionError(distribution)
  }
  return distribution
})

/**
 * Tells whether the backend index is an OpenSearch distribution, which has
 * no `_async_search` endpoint (icij/datashare#2349). A conclusive verdict is
 * fetched once and cached for the session.
 * @param {Object} api - The Datashare API instance
 * @returns {Promise<boolean>}
 */
export async function isOpenSearchDistribution(api) {
  try {
    const distribution = await probeDistribution(api)
    return distribution === ES_DISTRIBUTION.OPENSEARCH
  }
  catch {
    // An unreadable probe must not break search: Elasticsearch is the default
    // distribution, so fall back to the async path until a probe succeeds.
    return false
  }
}
