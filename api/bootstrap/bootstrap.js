

module.exports = function(app, config){

  // Express Engine
  require('./express')(app, undefined, config);

  // Routers
  require('./routers')(app, config);
};
