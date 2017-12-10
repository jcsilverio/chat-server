var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function (client) {
  console.log('Client connected...');
  client.on('messages', function (data){ //listen for message events
    console.log('data: ', data);
  });
});

app.get('/', function ( req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(8080);
console.log('Server running at 8080');