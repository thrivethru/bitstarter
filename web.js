var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());

var readPage = function(page) {
    var readPage = fs.readFileSync(page);
    return readPage.toString();
}

app.get('/', function(request, response) {
  response.send(readPage('index.html'));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
