import { findFoldedMatches, foldForFilter, foldWithSourceIndexes } from '@/utils/strings'

// Folding with offsets keeps two arrays per character: a whole 50 MB line (a
// minified JSON) would take gigabytes. Lines are cut into chunks so only one
// chunk at a time is ever folded that way.
export const CHUNK_LENGTH = 65536
// Each chunk reads this far into the next one, so a term shorter than the
// overlap is still found when it crosses a chunk boundary.
const CHUNK_OVERLAP = 1024

function chunkLine({ from, to }, doc) {
  const chunks = []
  for (let start = from; start < to; start += CHUNK_LENGTH) {
    const ownEnd = Math.min(start + CHUNK_LENGTH, to)
    const end = Math.min(ownEnd + CHUNK_OVERLAP, to)
    const folded = foldForFilter(doc.sliceString(start, end))
    chunks.push({ from: start, to: end, ownEnd, folded })
  }
  return chunks
}

/**
 * Fold a CodeMirror document into searchable chunks, each holding only the
 * folded text needed to rule it out.
 *
 * @param {Text} doc - The document to index.
 * @return {Object[]} - The `{ from, to, ownEnd, folded }` chunks, in document order.
 */
export function buildSearchIndex(doc) {
  const chunks = []
  for (let number = 1; number <= doc.lines; number++) {
    chunks.push(...chunkLine(doc.line(number), doc))
  }
  return chunks
}

// A match belongs to the chunk it starts in: the next chunk finds it again
// only through the overlap.
function findChunkMatches({ from, to, ownEnd }, doc, foldedTerm) {
  const text = doc.sliceString(from, to)
  return findFoldedMatches(text, foldedTerm)
    .map(({ start, end }) => ({ from: from + start, to: from + end }))
    .filter(match => match.from < ownEnd)
}

// Two chunks can each keep a match the other would have dropped for
// overlapping it ('aa' in 'aaa' across a boundary), so overlaps go here.
function dropOverlappingMatches(matches) {
  let lastKeptTo = -1
  return matches.filter((match) => {
    const isKept = match.from >= lastKeptTo
    if (isKept) {
      lastKeptTo = match.to
    }
    return isKept
  })
}

/**
 * Find every case- and accent-insensitive match of a term in an indexed document.
 *
 * @param {Object[]} chunks - The index built by `buildSearchIndex`.
 * @param {Text} doc - The indexed document.
 * @param {string} term - The term to find.
 * @return {Object[]} - The `{ from, to }` document ranges, in document order.
 */
export function findIndexMatches(chunks, doc, term) {
  const { folded } = foldWithSourceIndexes(term)
  // A term made only of combining marks folds to nothing, which every chunk
  // contains at every position: the scan would never move forward.
  if (!folded) {
    return []
  }
  const filter = foldForFilter(term)
  const candidates = chunks.filter(chunk => chunk.folded.includes(filter))
  const matches = candidates.flatMap(chunk => findChunkMatches(chunk, doc, folded))
  return dropOverlappingMatches(matches)
}
