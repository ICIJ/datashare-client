/**
 * Converts the anchor of a URL to lowercase (if it exists).
 * @param {string} url - The URL string to process.
 * @returns {string} The URL string with the anchor (if present) converted to lowercase.
 */
exports.normalizeAnchor = function (url) {
  // Split the URL into its parts
  const urlParts = url.split('#')

  // Check if the URL has an anchor
  if (urlParts.length === 2) {
    // Convert the anchor to lowercase
    const lowercaseAnchor = urlParts[1].toLowerCase()

    // Reconstruct the URL with the lowercase anchor
    return `${urlParts[0]}#${lowercaseAnchor}`
  }

  // Return the original URL if no anchor is found
  return url
}
