
var config = require('config.json')('./config/config.json');

var repositoryModel = require('./repository.model');
var commentModel = require('./comment.model');
var errorModel = require('./error.model');

var dateFormat = require('dateformat');

var async = require('async');

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : config.rds.host,
  user     : config.rds.user,
  password : config.rds.password,
  database : config.rds.database
});

conn.connect();


var errorPrefix = "postingModel/";


exports.loadAllPosting = function(idx, postingNum, callback){
  console.log("loadAllPosting");
  var resultObject = new Object({});

  var sql = "SELECT posting_id AS id, image_path_ln AS imagePath, thumbnail_path_ln AS thumbnailPath, create_dtm AS createTime, update_dtm AS updateTime FROM posting ORDER BY posting_id DESC LIMIT ?, ?";

  var sqlParams = [Number(idx), Number(postingNum)];

  conn.query(sql, sqlParams, function(error, result, fields){
    if(error){
      console.log("selectAllPosting error");
      console.log(error);
      resultObject.postingObject = null;

      var errorTitle = errorPrefix + "selectAllPosting error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      if(result.length === 0){
        resultObject.postingObject = null;
      }else{
        resultObject.postingObject = result;
      }

      callback(null, resultObject);
    }
  });
};


exports.removePosting = function(postingId, callback){
  console.log("removePosting");
  var resultObject = new Object({});

  var sql = "SELECT p.posting_id, image_path_ln, thumbnail_path_ln, content_txt, create_dtm, update_dtm FROM upload AS u, posting AS p WHERE u.posting_id = p.posting_id AND p.posting_id = ?";

  var sqlParams = [Number(postingId)];

  conn.query(sql, sqlParams, function(error, resultSelectPosting, fields){
    if(error){
      console.log("selectPosting error");
      console.log(error);
      resultObject.load = false;

      var errorTitle = errorPrefix + "selectPosting error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      resultObject.load = true;
      //console.log(resultSelectPosting);

      if(resultSelectPosting.length > 0){
        var keyArray = [];

        var imagePathArray = resultSelectPosting[0].imagePath.split("7talk/");
        var thumbnailPathArray = resultSelectPosting[0].thumbnailPath.split("7talk/");

        keyArray.push({Key:imagePathArray[1]});
        keyArray.push({Key:thumbnailPathArray[1]});


        async.waterfall([
          transaction,
          deleteComment,
          deleteUpload,
          deletePosting,
          deleteS3Images
        ], function(error, result){
          if(error){
            console.log("waterfall error");

            var sql = "ROLLBACK";

            conn.query(sql, function(error, resultRollback, fields){
              console.log("rollback");

              resultObject.signup = false;
              resultObject.setting = false;
              resultObject.information = false;
              resultObject.detailInformation = false;

              var errorTitle = errorPrefix + "waterfall error";

              errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                callback(true, resultObject);
              });
            });
          }else{
            console.log("waterfall");

            var sql = "COMMIT";

            conn.query(sql, function(error, resultCommit, fields){
              console.log("commit");
              //console.log(resultCommit);

              resultObject.signup = true;
              resultObject.setting = true;
              resultObject.information = true;
              resultObject.detailInformation = true;

              callback(null, resultObject);
            });
          }
        });

        function transaction(callback){
          var sql = "START TRANSACTION";

          conn.query(sql, function(error, resultTransaction, fields){
            console.log("startTransaction");
            if(error){
              console.log("transaction error");
              console.log(error);
              resultObject.transaction = false;

              var errorTitle = errorPrefix + "transaction error";

              errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                callback(true);
              });
            }else{
              //console.log(result);
              callback(null);
            }
          });
        }

        function deleteComment(callback) {
          var sql = "DELETE FROM comment WHERE posting_id = ?";

          var sqlParams = [postingId];

          conn.query(sql, sqlParams, function(error, resultDeleteComment){
            if(error){
              console.log("Delete comment error");
              console.log(error);
              resultObject.comment = false;

              var errorTitle = errorPrefix + "deleteComment error";

              errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                callback(true);
              });
            }else{
              console.log("deleteComment");
              resultObject.comment = true;
              callback(null);
            }
          });
        }

        function deleteUpload(callback){
          var sql = "DELETE FROM upload WHERE posting_id = ?";

          var sqlParams = [Number(postingId)];

          conn.query(sql, sqlParams, function(error, resultDeleteUpload, fields){
            if(error){
              console.log("deleteUpload error");
              console.log(error);
              resultObject.upload = false;

              var errorTitle = errorPrefix + "deleteUpload error";

              errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                callback(true);
              });
            }else{
              console.log("deleteUpload");
              callback(null);
            }
          });
        }

        function deletePosting(callback){
          var sql = "DELETE FROM posting WHERE posting_id = ?";

          var sqlParams = [Number(postingId)];

          conn.query(sql, sqlParams, function(error, resultDeletePosting, fields){
            if(error){
              console.log("deletePosting error");
              console.log(error);
              resultObject.posting = false;

              var errorTitle = errorPrefix + "deletePosting error";

              errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                callback(true);
              });
            }else{
              console.log("deletePosting");
              callback(null);
            }
          });
        }

        function deleteS3Images(callback){
          repositoryModel.removeS3Images(keyArray, function(error, resultRemove){
            if(error){
              console.log("removeS3Images error");
              console.log(error);
              resultObject.repository = false;

              var errorTitle = errorPrefix + "removeS3Images error";

              errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                callback(true);
              });
            }else{
              console.log("deleteS3Images");
              callback(null);
            }
          });
        }

      }else{
        console.log("No posting");
        resultObject.posting = false;

        var errorTitle = errorPrefix + "No posting error";

        errorModel.reportErrorLog(null, errorTitle, "No posting - delete", function(error, result){
          callback(true, resultObject);
        });
      }

    }
  });
};
