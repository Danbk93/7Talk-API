
var socketIO = require('socket.io');
var redis = require('socket.io-redis');

var config = require('config.json')('./config/config.json');

exports.startChatting = function(server, callback){
  var io = socketIO.listen(server);
  io.adapter(redis({
    host: config.redis.host,
    port: config.redis.port
  }));

  // 참고 링크
  // https://socket.io/docs/server-api/
  io.on('connection', function(socket) {
    //console.log('connection');

    socket.on('join', function(data){
      console.log('data: ' + data.roomName);


    });

    socket.on('chooseRoom', function(roomName){
      console.log('chooseRoom');
      // store the room name in the socket session for this client
      socket.room = roomName;
      // send client to room 1
      socket.join(socket.room);
    });


    socket.on('message', function(data){
      //TODO handle chatting data
      console.log(Object.keys(data));
      console.log(data.topicName);
      console.log(data.senderName);
      console.log(data.message);


      socket.broadcast.emit('updateChat', data);
    });
  });

  callback(null, null);
};
