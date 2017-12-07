
var socketIO = require('socket.io');
var redis = require('socket.io-redis');

var config = require('config.json')('./config/config.json');

var chattingModel = require('../models/chatting.model');

exports.startChatting = function(server, callback){
  var io = socketIO.listen(server);
  io.adapter(redis({
    host: config.redis.host,
    port: config.redis.port
  }));

  // 참고 링크
  // https://socket.io/docs/server-api/
  io.on('connection', function(socket) {
    //console.log('socket IO connection');

    socket.on('chooseRoom', function(data){
      console.log('chooseRoom');
      // store the room name in the socket session for this client
      var roomName = data.roomName;
      // send client to room 1

      socket.join(roomName);

      chattingModel.initPrequency(roomName, function(error, result){
        console.log("set", result);
      });
    });


    socket.on('message', function(data){
      //TODO handle chatting data
      var roomName = data.topicName;

      console.log(Object.keys(data));
      console.log(data.topicName);
      console.log(data.senderName);
      console.log(data.message);


      socket.in(roomName).broadcast.emit('updateChat', data);

      combo(roomName, function(error, resultCombo){
        if(resultCombo.code === 0){
          socket.to(roomName).emit('combo', comboObject);
        }
      });
    });
  });

  callback(null, null);
};


function combo(roomName, callback){
  var resultObject = new Object({});

  chattingModel.getStartTime(roomName, function(error, startTime){
    var nowTime = Date.now();
    var elapseTimeSec = (nowTime - startTime) / 1000;

    console.log(elapseTimeSec);

    if(elapseTimeSec > 60){
      chattingModel.initPrequency(roomName, function(error, result){
        console.log(result);
        resultObject.code = 1;

        callback(null, resultObject);
      });
    }else{
      chattingModel.incPrequencyCount(roomName, function(error, count){
        console.log("inc", count);

        if(count >= 6){
          chattingModel.initPrequency(roomName, function(error, result){
            console.log(result);


            resultObject.code = 0;

            var comboObject = new Object({});

            comboObject.comboNum = result;

            resultObject.comboObject = comboObject;

            callback(null, resultObject);
          });
        }else{
          resultObject.code = 2;

          callback(null, resultObject);
        }
      });

    }
  });
}
