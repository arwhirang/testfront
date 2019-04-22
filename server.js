var express = require('express'),
    colors = require('colors');

var app = express(),
    server = require('http').createServer(app);

var config = require('./config');

// Bootstrap Web and Api service
var bootstrap_path = './api/bootstrap/bootstrap';
require(bootstrap_path)(app, config);

// set app service port
app.set('port', process.env.PORT || config.port);

server.listen(app.get('port'), function(){
  console.log('# Server Booting success!'.red);
});

console.log(new Date().toISOString());
