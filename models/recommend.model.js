
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
    addInvitation(oppositeEmail, email);

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

function addInvitation(oppositeEmail, email){
  var key = oppositeEmail + "/invitation";

  var value = email;

  console.log(key, value);

  redisClient.sadd(key, email, function(error, result){
    console.log(result);

    return;
  });
}

exports.loadInvitation = function(oppositeEmail, callback){
  var resultObject = new Object({});

  var key = oppositeEmail + "/invitation";

  redisClient.smembers(key, function(error, result){
    var dataObject = new Object({});

    dataObject.result = result;

    resultObject.code = 0;
    resultObject.data = dataObject;

    callback(null, resultObject);
  });
};
