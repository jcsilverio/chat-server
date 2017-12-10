var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function (client) {
  client.on('join', function(name){
    client.nickname = name;
    console.log(`${name} + ' connected...'`);
  });


  client.on('messages', function (data){ //listen for message events\
    var nickname =  client.nickname;
    client.broadcast.emit('messages', nickname + ": " + data);

    client.emit('messages', nickname + ": " + data);
    console.log('data: ', data);
  });
});

app.get('/', function ( req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(8080);
console.log('Server running at 8080');