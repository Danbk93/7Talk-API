
var modelLog = "Chatting";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

var matchingModel = require('./matching.model');

var config = require('config.json')('./config/config.json');

var redis = require("redis");
var redisClient = redis.createClient(config.redis.port, config.redis.host);


exports.initPrequency = function(roomName, callback) {
  var key = roomName + "/preq/count";

  redisClient.set(key, 0, function(error, result){
    setStartTime(roomName);

    callback(null, result);
  });
};

function setStartTime(roomName) {
  var key = roomName + "/preq/start";

  var value = Date.now();

  console.log(value);

  redisClient.set(key, value, function(error, result){
    return ;
  });
}

exports.getStartTime = function(roomName, callback) {
  var key = roomName + "/preq/start";

  redisClient.get(key, function(error, result){
    callback(null, result);
  });
};

exports.incPrequencyCount = function(roomName, callback){
  var key = roomName + "/preq/count";

  redisClient.incr(key, function(error, result){
    callback(null, result);
  });
};


exports.getPrequencyCount = function(roomName, callback) {
  var key = roomName + "/preq/count";

  redisClient.get(key, function(error, result){
    callback(null, result);
  });
};

exports.loadUserChatroom = function(email, oppositeEmail, callback){
  var sql = "SELECT room_name_sn AS roomName FROM chatroom WHERE matching_id = (SELECT matching_id FROM matching WHERE (user_id = ? AND user_id2 = ?) OR (user_id = ? AND user_id2 = ?))"

  var sqlParams = [email, oppositeEmail, oppositeEmail, email];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(null, resultObject);
  });
};

exports.loadChatroom = function(email, callback){
  matchingModel.loadMatchingUser(email, function(error, userObject){
    var resultObject = new Object({});

    if(userObject.data.length > 0){
      var sql = "SELECT chatroom_id AS chatroomId, matching_id AS matchingId, room_name_sn AS roomName FROM chatroom";

      var sqlParams = [];

      for(var i = 0; i < userObject.data.length; i++){
        sqlParams.push(userObject.data[i].matchingId);

        if(i === 0){
          sql += " WHERE matching_id = ? ";
        }else if(i == userObject.data[i].lengh - 1){
          sql += " OR matching_id = ?";
        }else{
          sql += " OR matching_id = ?"
        }

      }

      //console.log(sql);

      //console.log(result);

      queryModel.request("select", modelLog, sql, sqlParams, function(error, chatroomObject){

        resultObject.code = 0;
        resultObject.message = "채팅방 로드 성공";

        resultObject.data = chatroomObject.data;

        callback(null, resultObject);
      });
    }else{
      resultObject.code = 0;
      resultObject.message = "채팅방 로드 성공";

      resultObject.data = {};

      callback(null, resultObject);
    }
  });
};
