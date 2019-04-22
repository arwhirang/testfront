var path = require('path');

var curr_version = '1.0'
const PORT = process.env.PORT//HEROKU

module.exports = {
  // server configuration
  port: PORT,
  isCORS_all: true,
  version: curr_version,

  // render configuration
  path: {
    public: path.join(__dirname + '/public'),
    views: path.join(__dirname + '/views'),
  },
}
