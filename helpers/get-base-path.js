const uploadPath = 'public/uploads'

function getBaseUploadPath(req) {
  return `${req.protocol}://${req.get('host')}/${uploadPath}/`
}

module.exports = {
  uploadPath,
  getBaseUploadPath,
}
