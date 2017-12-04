
var config = require('config.json')('./config/config.json');

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : config.rds.host,
  user     : config.rds.user,
  password : config.rds.password,
  database : config.rds.database
});

exports.reportErrorLog = function(userId, title, errorLog, callback){
  console.log("reportErrorLog");
  var resultObject = new Object({});

  var sql = "INSERT INTO error (title_mn, log_txt) VALUE (?, ?)";

  var log = JSON.stringify(errorLog);
  var sqlParams = [title, log];

  conn.connect();

  conn.query(sql, sqlParams, function(error, resultInsert){
    if(error){
      console.log(error);

      resultObject.code = 1;
      resultObject.message = "데이터베이스 오류입니다.";

      conn.end();

      callback(null, resultObject);
    }else{
      if(userId === null){
        resultObject.code = 0;
        resultObject.message = "오류가 보고되었습니다.";

        var dataObject = new Object({});

        dataObject.title = title;
        dataObject.log = log;
        dataObject.userId = null;

        resultObject.data = dataObject;

        conn.end();

        callback(null, resultObject);
      }else{
        var errorId = resultInsert.insertId;

        var sql = "INSERT INTO error (error_id, user_id) VALUE (?, ?)";

        var sqlParams = [errorId, userId];

        conn.query(sql, sqlParams, function(error, result){
          if(error){
            resultObject.code = 2;
            resultObject.message = "오류가 보고되었습니다. 데이터베이스 오류로 유저 등록에 실패하였습니다.";

            conn.end();

            callback(true, resultObject);
          }else{
            resultObject.code = 0;
            resultObject.message = "오류가 보고되었습니다.";

            var dataObject = new Object({});

            dataObject.title = title;
            dataObject.log = log;
            dataObject.userId = userId;

            resultObject.data = dataObject;

            conn.end();

            callback(null, resultObject);
          }
        });
      }
    }
  });
};
