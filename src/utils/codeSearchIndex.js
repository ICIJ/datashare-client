import { findFoldedMatches, foldForFilter } from '@/utils/strings'

// Folding with offsets keeps two arrays per character: a whole 50 MB line (a
// minified JSON) would take gigabytes. Lines are cut into chunks so only one
// chunk at a time is ever folded that way.
export const CHUNK_LENGTH = 65536
// Each chunk's folded text reads this far into the next one, so it still holds
// a short term that crosses the chunk boundary.
const CHUNK_OVERLAP = 1024
// A folded code unit comes from a few source ones at most (a letter and its
// decomposed accents, an astral char), which bounds how far past its own chunk
// a match can end.
const SOURCE_UNITS_PER_FOLDED_UNIT = 4

function chunkLine({ from, to }, doc) {
  const chunks = []
  for (let start = from; start < to; start += CHUNK_LENGTH) {
    const ownEnd = Math.min(start + CHUNK_LENGTH, to)
    const folded = foldForFilter(doc.sliceString(start, Math.min(ownEnd + CHUNK_OVERLAP, to)))
    chunks.push({ from: start, ownEnd, lineEnd: to, folded })
  }
  return chunks
}

/**
 * Fold a CodeMirror document into searchable chunks, each holding only the
 * folded text needed to rule it out.
 *
 * @param {Text} doc - The document to index.
 * @return {Object[]} - The `{ from, ownEnd, lineEnd, folded }` chunks, in document order.
 */
export function buildSearchIndex(doc) {
  const chunks = []
  for (let number = 1; number <= doc.lines; number++) {
    chunks.push(...chunkLine(doc.line(number), doc))
  }
  return chunks
}

function matchReach(foldedTerm) {
  return Math.max(CHUNK_OVERLAP, SOURCE_UNITS_PER_FOLDED_UNIT * foldedTerm.length)
}

// A term that can reach further than the folded overlap may cross a boundary
// without any chunk holding it whole, so no chunk can be ruled out for it.
function findCandidates(chunks, foldedTerm) {
  if (matchReach(foldedTerm) > CHUNK_OVERLAP) {
    return chunks
  }
  return chunks.filter(chunk => chunk.folded.includes(foldedTerm))
}

// A chunk scans on from where the last kept match ended, as a single scan of
// the whole line would, and keeps the matches that start in its own range: the
// next chunk finds the others again.
function findChunkMatches({ from, ownEnd, lineEnd }, doc, foldedTerm, scanFrom) {
  const start = Math.max(from, scanFrom)
  const text = doc.sliceString(start, Math.min(ownEnd + matchReach(foldedTerm), lineEnd))
  return findFoldedMatches(text, foldedTerm)
    .map(match => ({ from: start + match.start, to: start + match.end }))
    .filter(match => match.from < ownEnd)
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
  const folded = foldForFilter(term)
  // A term made only of combining marks folds to nothing, which every chunk
  // contains at every position: the scan would never move forward.
  if (!folded) {
    return []
  }
  const matches = []
  for (const chunk of findCandidates(chunks, folded)) {
    matches.push(...findChunkMatches(chunk, doc, folded, matches.at(-1)?.to ?? 0))
  }
  return matches
}
