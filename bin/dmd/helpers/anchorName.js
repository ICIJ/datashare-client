const { anchorName: dmdAnchorName } = require('dmd/helpers/ddata.js')

exports.anchorName = function (options) {
  return dmdAnchorName.call(this, options).toLowerCase()
}
