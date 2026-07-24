import humanId from 'human-id'

import { ES_SNAPSHOT_DIST_PREFIX, ES_SNAPSHOT_VER_PREFIX } from '@/enums/esSnapshots'
import { ES_DISTRIBUTION } from '@/enums/esDistributions'

/**
 * Generates a unique human-readable snapshot identifier.
 * @returns {string} A unique identifier like "curious-green-fox"
 */
const generateSnapshotId = () => humanId({ separator: '-', capitalize: false })

/**
 * Appends a prefixed suffix to a string if value is provided.
 * @param {string} str - The base string
 * @param {string} prefix - The prefix to use (e.g., "-dist:")
 * @param {string|null} value - The value to append
 * @returns {string} The string with optional suffix
 */
const appendPrefixedSuffix = (str, prefix, value) => (value ? `${str}${prefix}${value}` : str)

/**
 * Extracts a prefixed suffix from a string.
 * @param {string} str - The string to extract from
 * @param {string} prefix - The prefix to look for
 * @returns {{value: string|null, remaining: string}} The extracted value and remaining string
 */
const extractPrefixedSuffix = (str, prefix) => {
  const pattern = new RegExp(`${prefix}([^-]+)$`)
  const match = str.match(pattern)
  return match
    ? { value: match[1], remaining: str.replace(pattern, '') }
    : { value: null, remaining: str }
}

/**
 * Extracts the version suffix from a snapshot name.
 * @param {string} str - The snapshot name
 * @returns {{value: string|null, remaining: string}} The extracted version and remaining string
 */
const extractSnapshotVersion = (str) => {
  const pattern = new RegExp(`${ES_SNAPSHOT_VER_PREFIX}(.+)$`)
  const match = str.match(pattern)
  return match
    ? { value: match[1], remaining: str.replace(pattern, '') }
    : { value: null, remaining: str }
}

/**
 * Extracts the distribution suffix from a snapshot name.
 * @param {string} str - The snapshot name
 * @returns {{value: string|null, remaining: string}} The extracted distribution and remaining string
 */
const extractSnapshotDistribution = str => extractPrefixedSuffix(str, ES_SNAPSHOT_DIST_PREFIX)

/**
 * Formats a snapshot name with optional version and distribution.
 * @param {string|null} [version=null] - The Elasticsearch version
 * @param {string|null} [distribution=null] - The Elasticsearch distribution
 * @returns {string} The formatted snapshot name like "curious-green-fox-dist:opensearch-ver:2.11.0"
 */
export const formatSnapshotName = (version = null, distribution = null) => {
  const id = generateSnapshotId()
  const withDistribution = appendPrefixedSuffix(id, ES_SNAPSHOT_DIST_PREFIX, distribution)
  const withVersion = appendPrefixedSuffix(withDistribution, ES_SNAPSHOT_VER_PREFIX, version)
  return withVersion
}

/**
 * @typedef {Object} ParsedSnapshotName
 * @property {string|null} name - The base snapshot name without version/distribution
 * @property {string|null} version - The Elasticsearch version
 * @property {string} distribution - The Elasticsearch distribution (defaults to "elasticsearch")
 */

/**
 * Parses a snapshot name to extract the base name, version, and distribution.
 * @param {string|null} fullName - The full snapshot name to parse
 * @returns {ParsedSnapshotName} The parsed components
 */
export const parseSnapshotName = (fullName) => {
  const { value: version, remaining: withoutVersion } = extractSnapshotVersion(fullName ?? '')
  const { value: distribution, remaining: name } = extractSnapshotDistribution(withoutVersion)
  return {
    name: name || null,
    version,
    distribution: distribution || ES_DISTRIBUTION.ELASTICSEARCH
  }
}
