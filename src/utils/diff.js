/**
 * Compares two lists of entries and returns the differences in additions and deletions.
 * @param {[string, any][]} entriesA - The list of entries A.
 * @param {[string, any][]} entriesB - The list of entries B.
 * @returns {{$additions: Object, $deletions: Object}} An object containing additions and deletions.
 */
export default function diff(entriesA, entriesB) {
  return {
    $additions: getDifferences(entriesB, entriesA),
    $deletions: getDifferences(entriesA, entriesB)
  }
}

/**
 * Identifies differences from the first entries compared to the second entries.
 * @param {[string, any][]} entriesA - The lust of entries A.
 * @param {[string, any][]} entriesB - The list of entries B.
 * @returns {Object} An object containing the differences.
 */
function getDifferences(entriesA = [], entriesB = []) {
  const differences = {}

  entriesA.forEach(([keyA, valueA]) => {
    if (!entriesB.some(([keyB, valueB]) => keyB === keyA && valueB === valueA)) {
      differences[keyA] = differences[keyA] || []
      if (!differences[keyA].includes(valueA)) {
        differences[keyA].push(valueA)
      }
    }
  })

  return differences
}
