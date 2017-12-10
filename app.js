var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


var storedMessages = [];

var saveMessage = function (name, data){
  storedMessages.push({
    name: name,
    data: data
  });

  // if more than 10 messges long, remove the first message
  if(storedMessages.length > 10) {
    storedMessages.shift();
  }
  console.log(storedMessages);
}


io.on('connection', function(client) {
  client.on('join', function(name) {
    // emit a message on the connecting client for each existing message
    storedMessages.forEach(function(message){
      client.emit('messages', message.name + ": " + message.data);

    });
    client.nickname = name;
    console.log(`${name} connected...`);
  });


client.on('messages', function(data) { //listen for message events\
    var nickname = client.nickname;
    client.broadcast.emit('messages', nickname + ": " + data);

    client.emit('messages', nickname + ": " + data);
    // console.log('data: ', data);
    saveMessage(nickname, data);
  });
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(8080);
console.log('Server running at 8080');