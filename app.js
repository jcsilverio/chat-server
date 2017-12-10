var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('redis');
var redisClient = redis.createClient();



var saveMessage = function(name, data) {
  //need to turn obj into string to store in redis
  var message = JSON.stringify({
    name: name,
    data: data
  });

  redisClient.lpush("messageList", message, function(err, response) {
    console.log('lpush err:', err);
    //keep newest 10 messages in the array

    redisClient.ltrim("messageList", 0, 9);
  });
}


io.on('connection', function(client) {
  client.on('join', function(name) {
    // //notify other clients that a participant has joined
    // client.broadcast.emit("add chatter", name);
    // //add name to redis set

    // redisClient.smembers('names', function(err, names) {
    //   names.forEach(function(name) {
    //     client.emit('add chatter', name);
    //   });
    // });
    // redisClient.sadd("chatters", name);

    // emit a message on the connecting client for each existing message
    redisClient.lrange("messageList", 0, -1, function(err, messages) {
      console.log('lrange err:', err);
      //reverse messages to be read in correct order
      // messages = messages.reverse();

      messages.forEach(function(message) {
        //parse into JSON object
        message = JSON.parse(message);
        client.emit("messages", message.name + ": " + message.data);
      });
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


  // client.on('disconnect', function(){
  //   // console.log('name on disconnect', name);
  //   // console.log('type on disconnect', typeof name);
  //   console.log('existing nickname', client.nickname);
  //   // client.get('nickname', function(err, name){
  //   //   client.broadcast.emit('remove chatter', name);

  //   //   redisClient.srem("chatters", name);
  //   // });
  // });
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(8080);
console.log('Server running at 8080');