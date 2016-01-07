
exports = function(req, res, next) {
  console.error('404: ' + req.url);
  res.status(404).send('Not Found');
};