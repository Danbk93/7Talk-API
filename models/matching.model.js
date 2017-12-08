
var async = require('async');

var modelLog = "Recommend";
var errorModel = require('./error.model');

var recommendModel = require('./recommend.model');

var queryModel = require('./query.model');

var randomString = require('../js/random_string');

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
  Matching table
*/
exports.addMatching = function(email, oppositeEmail, callback){
  console.log("addMatching");
  var resultObject = new Object({});

  if(oppositeEmail !== undefined){
    async.waterfall([
      transaction,
      checkMatching,
      insertMatching,
      insertChatroom,
      updateRecommend,
      recommendModel.deleteInvitationAlert
    ], function(error, result){
      if(error){
        var sql = "ROLLBACK";

        conn.query(sql, function(error, resultRollback){
          console.log("rollback");

          callback(true, resultObject);
        });
      }else{
        console.log("waterfall");

        var sql = "COMMIT";

        conn.query(sql, function(error, resultCommit){
          console.log("commit");
          //console.log(resultCommit);
          //console.log(result);

          resultObject.code = 0;
          resultObject.message = "매칭에 성공하였습니다.";

          callback(null, resultObject);
        });
      }

    });
  }else{
    resultObject.code = 2;
    resultObject.message = "잘못된 요청입니다.";

    callback(null, resultObject);
  }



  function transaction(callback){
    var sql = "START TRANSACTION";

    conn.query(sql, function(error, resultTransaction){
      console.log("startTransaction");
      callback(null);
    });
  }

  function checkMatching(callback){
    var sql = "SELECT matching_id AS matchingId, user_id AS userId, user_id2 AS userId2, matching_dtm AS matchingTime, similarity_n AS similarity FROM matching WHERE (user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND (SELECT user_id FROM user WHERE email_mn = ?)) OR (user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND user_id2 = (SELECT user_id FROM user WHERE email_mn = ?))";

    var sqlParams = [email, oppositeEmail, oppositeEmail, email]

    conn.query(sql, sqlParams, function(error, resultCheck){
      console.log("startTransaction");
      console.log(resultCheck);
      if(resultCheck.length > 0){
        callback(true);
      }else{
        callback(null);
      }
    });
  }

  function insertMatching(callback) {
    console.log("insertMatching");

    console.log(email, oppositeEmail);

    var sql = "INSERT INTO matching (user_id, user_id2, matching_dtm) VALUE ((SELECT user_id FROM user WHERE email_mn = ?), (SELECT user_id AS user_id2 FROM user WHERE email_mn = ?), NOW())";
    var sqlParams = [email, oppositeEmail];

    removeInvitation(oppositeEmail, email);

    conn.query(sql, sqlParams, function(error, resultInsert){
      if(error){
        console.log("insertMatching error");
        console.log(error);

        resultObject.code = 1;
        resultObject.message = "데이터베이스 오류입니다.";

        var errorTitle = modelLog;

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, null);
        });
      }else{
        var matchingId = resultInsert.insertId;

        callback(null, matchingId);
      }
    });
  }

  function insertChatroom(matchingId, callback){
    var resultObject = new Object({});

    var roomName = randomString.randomString(10);

    var sql = "INSERT INTO chatroom (matching_id, room_name_sn) VALUE (?, ?)";

    var sqlParams = [matchingId, roomName];

    //console.log(sqlParams);

    conn.query(sql, sqlParams, function(error, chatroomObject){
      callback(null);
    });
  }

  function updateRecommend(callback){
    console.log("updateRecommend");

    var sql = "UPDATE recommend SET match_check = true WHERE (user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND user_id2 = (SELECT user_id FROM user WHERE email_mn = ?)) OR (user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND user_id2 = (SELECT user_id FROM user WHERE email_mn = ?))";

    var sqlParams = [email, oppositeEmail, oppositeEmail, email];

    conn.query(sql, sqlParams, function(error, resultInsert){
      if(error){
        console.log("updateRecommend error");
        console.log(error);

        resultObject.code = 2;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = modelLog;

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, null, null);
        });
      }else{
        callback(null, email, oppositeEmail);
      }
    });
  }
};

function removeInvitation(oppositeEmail){
  var key = oppositeEmail + "/invitation";

  redisClient.del(key, function(error, result){
    console.log(result);

    return;
  });
}

exports.loadMatchingUser = function(email, callback){
  var sql = "SELECT matching_id AS matchingId, user_id AS userId, user_id2 AS userId2, matching_dtm AS matchingTime, similarity_n AS similarity FROM matching WHERE user_id IN (SELECT user_id FROM user WHERE email_mn = ?) OR user_id2 IN (SELECT user_id FROM user WHERE email_mn = ?)";

  var sqlParams = [email, email];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

exports.checkAlreadyMatch = function(email, oppositeEmail, callback){
  // TODO modify
  callback(null, true);
};

exports.loadMatchingData = function(callback){
  var sql = "SELECT * FROM matching WHERE user_id = (SELECT user_id FROM user)";

  var sqlParams = [];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};
