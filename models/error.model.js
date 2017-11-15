
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

  var sql = "INSERT INTO error (error_title_mn, error_log_txt) VALUE (?, ?)";

  var log = JSON.stringify(errorLog);
  var sqlParams = [title, log];

  conn.connect();

  conn.query(sql, sqlParams, function(error, resultInsert){
    if(error){
      resultObject.log = false;
      console.log(error);

      conn.end();

      callback(null, resultObject);
    }else{
      if(userId === null){
        resultObject.log = true;

        conn.end();

        callback(null, resultObject);
      }else{
        resultObject.log = true;

        var errorId = resultInsert.insertId;

        var sql = "INSERT INTO error (error_id, user_id) VALUE (?, ?)";

        var sqlParams = [errorId, userId];

        conn.query(sql, sqlParams, function(error, result){
          if(error){
            resultObject.insert = false;

            conn.end();

            callback(true, resultObject);
          }else{
            resultObject.insert = true;

            conn.end();

            callback(null, resultObject);
          }
        });
      }
    }
  });
};
