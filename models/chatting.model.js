
var modelLog = "Chatting";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

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
