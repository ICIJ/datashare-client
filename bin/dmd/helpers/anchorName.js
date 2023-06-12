const { anchorName: dmdAnchorName } = require('dmd/helpers/ddata')

/**
 * Retrieves the anchor name from the 'dmdAnchorName' helper and converts it to lowercase.
 * @param {object} options - The options object passed to the function.
 * @returns {string} The lowercase anchor name.
 */
exports.anchorName = function (options) {
  return dmdAnchorName.call(this, options).toLowerCase()
}
