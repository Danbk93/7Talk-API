
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
      resultObject.error = true;

      var errorTitle = errorPrefix + logSummary;

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){

        callback(true, resultObject);
      });
    }else{
      resultObject.error = false;
      resultObject.type = queryType;
      if(queryType === "insert"){
        resultObject.insertId = responseObject.insertId;
      }else if(queryType === "select"){
        resultObject.data = responseObject;
      }

      callback(null, resultObject);
    }
  });
};
