
var config = require('config.json')('./config/config.json');

var errorModel = require('./error.model');

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : config.rds.host,
  user     : config.rds.user,
  password : config.rds.password,
  database : config.rds.database
});


conn.connect();

// Basic form CRUD
// queryType : "insert", "select", "update", "delete"
exports.request = function(queryType, modelLogName, sql, sqlParams, callback){
  var errorPrefix = "Model/" + modelLogName + "/";
  console.log(queryType + modelLogName);

  var resultObject = new Object({});


  conn.query(sql, sqlParams, function(error, responseObject){
    if(error){
      var logSummary = queryType + " " + modelLogName + " error";
      console.log(logSummary);
      console.log(error);

      resultObject.type = queryType;
      resultObject.code = 1; resultObject.message = "데이터베이스 오류입니다.";

      var dataObject = new Object({});

      dataObject.type = queryType;

      resultObject.data = dataObject;

      var errorTitle = errorPrefix + logSummary;

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      resultObject.code = 0;
      resultObject.message = "요청에 성공하였습니다.";

      var dataObject = new Object({});

      dataObject.type = queryType;

      if(queryType === "insert"){
        dataObject.insertId = responseObject.insertId;

        resultObject.data = dataObject;
      }else if(queryType === "select"){
        resultObject.data = responseObject;
      }

      callback(null, resultObject);
    }
  });
};
