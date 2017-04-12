module.exports = function(app) {

  app.use('/api/stats', require('./api/stats/index'));
  app.use('/api/projects', require('./api/projects/index'));
  app.use('/api/users', require('./api/users/index'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|app|assets)/*')
   .get(function(req, res) {
    res.send(404);
  })

};