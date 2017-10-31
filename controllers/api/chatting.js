
var socketIO = require('socket.io');
var redis = require('socket.io-redis');

var config = require('config.json')('./config/config.json');

/*
var mqtt = require('mqtt');

var mqttClient = mqtt.connect('mqtt://' + config.mqtt.host);

mqttClient.on('connect', function () {
    console.log("MQTT Connect");
});
*/

exports.startChatting = function(server, callback){
  var io = socketIO.listen(server);
  io.adapter(redis({
    host: config.redis.host,
    port: config.redis.port
  }));

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

      //mqttClient.subscribe(roomName);
    });


    socket.on('message', function(data){
      console.log('data: ' + data.message);

      socket.broadcast.emit('updateChat', data);
/*
      mqttClient.publish(data.topicName, JSON.stringify(data));

      mqttClient.on('message', function (topicName, data) {
        console.log('topicName : ' + topicName);
        console.log('data : ' + data);

        socket.emit('updateChat', JSON.parse(data));

        //mqttClient.publish(topicName, data);
        //mqttClient.unsubscribe(topicName);
      });
*/
    });
  });

  callback(null, null);
};
