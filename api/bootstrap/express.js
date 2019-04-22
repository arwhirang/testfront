// NPMs
var favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    express = require('express');

// Cross-Origin Reouse Sharing... (All access allow)
var CORS_all = function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', true);
  next();
};

module.exports = function(app, passport, config){
  // set view engine and view file's root path
  app.set('views', config.path.views);
  app.set('view engine', 'jade');

  app.use(favicon(config.path.public + '/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(config.path.public));
  
  
  if(config.isCORS_all)
    app.use(CORS_all)
};
