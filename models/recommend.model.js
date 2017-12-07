
var async = require('async');


var modelLog = "Recommend";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

var config = require('config.json')('./config/config.json');

var redis = require("redis");
var redisClient = redis.createClient(config.redis.port, config.redis.host);

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : config.rds.host,
  user     : config.rds.user,
  password : config.rds.password,
  database : config.rds.database
});

conn.connect();

/*
  Recommend table
*/
exports.addRecommend = function(email, oppositeUserArray, similarityArray, callback){

  console.log(email);
  console.log(oppositeUserArray);

  async.parallel({
    user : function(callback){
      var sql = "SELECT user_id AS userId FROM user WHERE email_mn = ?";

      var sqlParams = [email];

      conn.query(sql, sqlParams, function(error, userObject){
        console.log(userObject);
        callback(error, userObject[0].userId);
      });
    },
    user1 : function(callback){
      var sql = "SELECT user_id AS userId FROM user WHERE email_mn = ?";

      var sqlParams = [oppositeUserArray[0]];

      conn.query(sql, sqlParams, function(error, userObject){
        console.log(userObject);
        callback(error, userObject[0].userId);
      });
    },
    user2 : function(callback){
      var sql = "SELECT user_id AS userId FROM user WHERE email_mn = ?";

      var sqlParams = [oppositeUserArray[1]];

      conn.query(sql, sqlParams, function(error, userObject){
        console.log(userObject);
        callback(error, userObject[0].userId);
      });
    },
    user3 : function(callback){
      var sql = "SELECT user_id AS userId FROM user WHERE email_mn = ?";

      var sqlParams = [oppositeUserArray[2]];

      conn.query(sql, sqlParams, function(error, userObject){
        console.log(userObject);
        callback(error, userObject[0].userId);
      });
    }
  }, function(error, results){
    console.log(results);

    var sql = "INSERT INTO recommend (user_id, user_id2, similarity_n, match_check) VALUES ?";

    var sqlParams = [[Number(results.user), Number(results.user1), similarityArray[0], false], [Number(results.user), Number(results.user2), similarityArray[1], false], [Number(results.user), Number(results.user3), similarityArray[2], false]];

    console.log(sqlParams);

    conn.query(sql, [sqlParams], function(error, result) {
      //console.log(result);
      var resultObject = new Object({});

      if(error){
        resultObject.code = 1;
        resultObject.message = "데이터베이스 오류입니다."

        callback(null, resultObject);
      }else{
        addInvitation(email, oppositeUserArray);
        makeAlert(email, oppositeUserArray);


        resultObject.code = 0;
        resultObject.message = "알림을 보내는데 성공했습니다."

        callback(null, resultObject);
      }


    });

  });


};

exports.loadRecommend = function(email, matchCheck, callback){
  var sql = "SELECT * FROM recommend WHERE user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND match_check = ?";

  var sqlParams = [email, matchCheck];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

function addInvitation(email, oppositeUserArray){
  var key = email + "/invitation";

  redisClient.sadd(key, oppositeUserArray[0], function(error, result){
    console.log(result);
  });
  redisClient.sadd(key, oppositeUserArray[1], function(error, result){
    console.log(result);
  });
  redisClient.sadd(key, oppositeUserArray[2], function(error, result){
    console.log(result);
  });
  return;
}

function makeAlert(email, oppositeUserArray){
  console.log("makeAlert");
  for(var i = 0; i < oppositeUserArray.length; i++){
    var key = oppositeUserArray[i] + "/alert";

    var value = email;

    redisClient.sadd(key, value);

    if(i == oppositeUserArray.length - 1){
      return ;
    }
  }
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
