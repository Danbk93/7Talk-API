
var async = require('async');

var modelLog = "Recommend";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

var config = require('config.json')('./config/config.json');

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
exports.addMatching = function(userEmail, oppositeEmail, similarity, callback){
  var resultObject = new Object({});

  async.waterfall([
    transaction,
    insertMatching,
    updateRecommend
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


  function transaction(callback){
    var sql = "START TRANSACTION";

    conn.query(sql, function(error, resultTransaction){
      console.log("startTransaction");
      callback(null);
    });
  }

  function insertMatching(callback) {
    console.log("insertMatching");

    var sql = "INSERT INTO recommend (user_id, user_id2, similarity_n, match_check, recommend_dtm) VALUE ((SELECT user_id FROM user WHERE email_mn = ?), (SELECT user_id FROM user WHERE email_mn = ?), ?, false, NOW())";
    var sqlParams = [userEmail, oppositeEmail, similarity];

    conn.query(sql, function(error, resultInsert){
      if(error){
        console.log("insertMatching error");
        console.log(error);

        resultObject.code = 1;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = modelLog;

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, true);
      }
    });
  }

  function updateRecommend(callback){
    console.log("updateRecommend");

    var sql = "UPDATE recommend SET match_check = true WHERE (user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND user_id2 = (SELECT user_id FROM user WHERE email_mn = ?)) OR (user_id = (SELECT user_id FROM user WHERE email_mn = ?) AND user_id2 = (SELECT user_id FROM user WHERE email_mn = ?))";

    var sqlParams = [email, oppositeEmail, oppositeEmail, email, similarity];

    conn.query(sql, function(error, resultInsert){
      if(error){
        console.log("updateRecommend error");
        console.log(error);

        resultObject.code = 2;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = modelLog;

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, true);
      }
    });
  }
};

exports.loadMatchingUser = function(userEmail, callback){
  var sql = "SELECT * FROM matching WHERE user_id = (SELECT user_id FROM user WHERE email_mn = ?)";

  var sqlParams = [userEmail];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

exports.loadMatchingData = function(callback){
  var sql = "SELECT * FROM matching WHERE user_id = (SELECT user_id FROM user)";

  var sqlParams = [];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};
