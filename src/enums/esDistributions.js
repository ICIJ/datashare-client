const ELASTICSEARCH = 'elasticsearch'
const OPENSEARCH = 'opensearch'

export const ES_DISTRIBUTION = Object.freeze({
  ELASTICSEARCH,
  OPENSEARCH
})

export const ES_DISTRIBUTION_LIST = Object.values(ES_DISTRIBUTION)
export const esDistributionValidator = v => ES_DISTRIBUTION_LIST.includes(v)
