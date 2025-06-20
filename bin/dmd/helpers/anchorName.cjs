const path = require('path')
const dmdPath = require.resolve('dmd')
const dmdDir = path.dirname(dmdPath)
const { anchorName: dmdAnchorName } = require(path.join(dmdDir, 'helpers', 'ddata.js'))

/**
 * Retrieves the anchor name from the 'dmdAnchorName' helper and converts it to lowercase.
 * @param {object} options - The options object passed to the function.
 * @returns {string} The lowercase anchor name.
 */
exports.anchorName = function (options) {
  return dmdAnchorName
    .call(this, options)
    .toLowerCase()
    .replace(/[ -_]+/g, '-')
    .replace(/[^a-z0-9_ -]/g, '')
}
