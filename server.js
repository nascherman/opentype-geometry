var express = require('express');
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static('static'));

var port = process.env.PORT || 8080;

const server = app.listen(port, function () {
  console.log('server up and running port', port);
});