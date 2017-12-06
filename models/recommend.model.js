
var modelLog = "Recommend";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

var config = require('config.json')('./config/config.json');

var redis = require("redis");
var redisClient = redis.createClient(config.redis.port, config.redis.host);

/*
  Recommend table
*/
exports.addRecommend = function(email, oppositeEmail, similarity, callback){
  var sql = "INSERT INTO recommend (user_id, user_id2, similarity_n, match_check, recommend_dtm) VALUE ((SELECT user_id FROM user WHERE email_mn = ?), (SELECT user_id FROM user WHERE email_mn = ?), ?, false, NOW())";

  var sqlParams = [email, oppositeEmail, similarity];

  queryModel.request("insert", modelLog, sql, sqlParams, function(error, resultObject){
    addInvitation(email, oppositeEmail);
    addAlert(email, oppositeEmail);

    callback(error, resultObject);
  });
};

exports.loadRecommend = function(email, matchCheck, callback){
  var sql = "SELECT * FROM recommend WHERE user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND match_check = ?";

  var sqlParams = [email, matchCheck];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

function addInvitation(email, oppositeEmail){
  var key = email + "/invitation";

  var value = oppositeEmail;

  console.log(key, value);

  redisClient.sadd(key, email, function(error, result){
    console.log(result);

    return;
  });
}

function addAlert(email, oppositeEmail){
  var key = oppositeEmail + "/alert";

  var value = email;

  console.log(key, value);

  redisClient.sadd(key, email, function(error, result){
    console.log(result);

    return;
  });
}

exports.loadInvitation = function(email, callback){
  var resultObject = new Object({});

  var key = email + "/invitation";

  redisClient.smembers(key, function(error, result){
    var dataObject = new Object({});

    dataObject.result = result;

    resultObject.code = 0;
    resultObject.data = dataObject;

    callback(null, resultObject);
  });
};

exports.loadAlert = function(oppositeEmail, callback){
  var resultObject = new Object({});

  var key = oppositeEmail + "/alert";

  redisClient.smembers(key, function(error, result){
    var dataObject = new Object({});

    dataObject.result = result;

    resultObject.code = 0;
    resultObject.data = dataObject;

    callback(null, resultObject);
  });
};
