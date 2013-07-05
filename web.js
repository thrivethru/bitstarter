var express = require('express');
var fs = require('fs');
var buffer = require('buffer');

var app = express.createServer(express.logger());
var index = new buffer(fs.readFileSync('./index.html'));

app.get('/', function(request, response) {
  response.send(index.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
