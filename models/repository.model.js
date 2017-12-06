
var randomString = require('../js/random_string');

var config = require('config.json')('./config/config.json');

var errorModel = require('./error.model');

var async = require('async');

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/s3_config.json');

var s3Host = config.s3.host;
var s3BucketName = config.s3.bucket;
var s3Prefix = config.s3.prefix;

var s3Bucket = new AWS.S3( { params: {Bucket: s3BucketName} } );

const qs = require('querystring');

var multiparty = require('multiparty');
var fs = require('fs');

var gm = require('gm');

var util = require('util');

var dateFormat = require('dateformat');

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : config.rds.host,
  user     : config.rds.user,
  password : config.rds.password,
  database : config.rds.database,
  charset : 'utf8mb4'
});

conn.connect();

var errorPrefix = "repositoryModel/";

exports.uploadImage = function(req, callback){
  var resultObject = new Object({});
  var content = "";
  var email = "";

  console.log("uploadImage");

  var form = new multiparty.Form();

  form.on('field', function(name, value){

  });

  form.on('part', function (part) {

  });

  // all uploads are completed
  form.on('close',function(){

  });

  // track progress
  form.on('progress',function(byteRead, byteExpected){
    //console.log(' Reading total  '+ byteRead + '/' + byteExpected);
  });

  form.on('error', function (err) {
    //console.log('error');
    //handle other error
  });

  form.parse(req, function(error, fields, files){
    //console.log(req.files);
    //console.log(fields);
    //console.log(req.body);
    //console.log(files);
    var myFile = files.file[0];

    //email = fields.email[0];
    email = req.decoded.data.email;

    content = fields.content.toString().replace(/\r\n|\r|\n/g, '<br />');
    const check = fields.check;
    //console.log(check);

    var originalFileNameArray = myFile.originalFilename.split(".");

    console.log(email, content);

    var params = {
      Key: 'Path',
  		ACL:'public-read',
      Body: "",
      Metadata: {
          'Content-Type': 'image/jpeg'
      }
    };

    var stringNum = 5;
    var randomWord = randomString.randomString(stringNum);

    var fileName = Date.now() + "-" + randomWord + "." + originalFileNameArray[1];

    var file = fs.createReadStream(myFile.path);
    gm(file)
      .autoOrient()
      .stream(function(error, stdout, stderr){
        //console.log(stdout);

        var buf = new Buffer('');
        stdout.on('data', function(data) {
           buf = Buffer.concat([buf, data]);
        });
        stdout.on('end', function(data) {

          params.Body = buf;

          params.Key = s3Prefix + "/posting/" + fileName;

          //console.log(params.Key);

          async.parallel({
            image: function(callback){
              s3Bucket.putObject(params, function (error, data) {
                  if (error) {
                      console.log("putObject error");
                      //handle error
                      resultObject.code = 1;
                      resultObject.message = "이미지 등록 오류입니다.";

                      var errorTitle = errorPrefix + "putObject error";

                      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                        callback(true, resultObject);
                      });
                  } else {
                      console.log("putObject");
                      //handle upload complete

                      //delete the temp file
                      fs.unlink(myFile.path);
                      callback(null, true);
                  }
              });
            },
            user: function(callback){
              var sql = "SELECT user_id AS id, email_mn AS email, password_ln AS password FROM user WHERE email_mn = ?";
              var sqlParams = [email];

              conn.query(sql, sqlParams, function(error, resultSelectUser){
                if(error){
                  console.log("Error selectUser");
                  console.log(error);

                  resultObject.code = 2;
                  resultObject.message = "데이터베이스 오류입니다."

                  errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                    callback(true, resultObject);
                  });
                }else{
                  var userId = null;

                  if(resultSelectUser.length > 0){
                    userId = resultSelectUser[0].id;

                    var userObject = new Object({});
                    userObject.userId = userId;

                    callback(null, userObject);
                  }else{
                    resultObject.code = 3;
                    resultObject.message = "이미지 등록 오류입니다.";

                    callback(true, null);
                  }


                }
              });
            }
          }, function(error, results){
            if(error){
              console.log("parallel error");
              console.log(error);

              var errorTitle = errorPrefix + "parallel error";

              errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                callback(true, null);
              });
            }else{
              console.log("parallel");
              //console.log(results);

              var userId = results.user.userId;
              var imagePath = s3Host + "/" + s3BucketName + "/" + params.Key;
              var cropPath = s3Host + "/" + s3BucketName + "/" + "resize/l/7talk/"+ fileName;
              var thumbnailPath = s3Host + "/" + s3BucketName + "/" + "resize/s/7talk/"+ fileName;
              var postingId = -1;

              if(results.image){
                async.waterfall([
                  transaction,
                  insertPosting,
                  insertUpload
                ], function(error, result){
                  if(error){
                    console.log("waterfall error");

                    var sql = "ROLLBACK";

                    conn.query(sql, function(err, resultRollback, fields){
                      console.log("rollback");
                      console.log(error);

                      var keyArray = [];

                      var imagePathArray = imagePath.split("7talk/");
                      var cropPathArray = cropPath.split("7talk/");
                      var thumbnailPathArray = thumbnailPath.split("7talk/");

                      keyArray.push({Key:imagePathArray[1]});
                      keyArray.push({Key:cropPathArray[1]});
                      keyArray.push({Key:thumbnailPathArray[1]});

                      //console.log(keyArray);

                      deleteS3Image(keyArray, function(err, resultRollback){
                        var errorTitle = errorPrefix + "waterfall error";

                        errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                          callback(true, null);
                        });
                      });

                    });
                  }else{
                    console.log("waterfall");

                    var sql = "COMMIT";

                    conn.query(sql, function(error, resultCommit, fields){
                      console.log("commit");

                      resultObject.code = 0;
                      resultObject.message = "이미지 등록에 성공하였습니다.";

                      var dataObject = new Object({});

                      dataObject.postingId = postingId;
                      dataObject.content;
                      dataObject.email = email;
                      dataObject.imaimagePath = imagePath;
                      dataObject.thumbnailPath = thumbnailPath;

                      resultObject.data = dataObject;

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
                      //TODO modify callback
                      callback(true);
                    }else{
                      //console.log(result);
                      callback(null);
                    }
                  });
                }

                function insertPosting(callback){
                  var sql = 'INSERT INTO posting (image_path_ln, thumbnail_path_ln, content_txt, hits_n, likes_n, update_dtm) VALUE (?, ?, ?, 0, 0, NOW())';

                  var sqlParams = [imagePath, thumbnailPath, content];

                  conn.query(sql, sqlParams, function (error, resultInsertPosting) {
                    if (error){
                      console.log("insertPosting error");
                      console.log(error);
                      resultObject.code = 4;
                      resultObject.message = "데이터베이스 오류입니다.";

                      var errorTitle = errorPrefix + "insertPosting error";

                      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                        callback(true, resultObject);
                      });
                    }else{
                      console.log("insertPosting");

                      postingId = resultInsertPosting.insertId;

                      callback(null, postingId, userId);
                    }
                  });
                }

                function insertUpload(postingId, userId, callback){
                  var sql = 'INSERT INTO upload (posting_id, user_id) VALUE (?, ?)';
                  var sqlParams = [Number(postingId), Number(userId)];

                  conn.query(sql, sqlParams, function (error, results, fields) {
                    if(error){
                      console.log("insertUpload error");
                      console.log(error);
                      resultObject.code = 5;
                      resultObject.message = "데이터베이스 오류입니다.";

                      var errorTitle = errorPrefix + "insertUpload error";

                      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                        callback(true, resultObject);
                      });
                    }else{
                      console.log("insertUpload");

                      callback(null, resultObject);
                    }

                  });
                }
              }else{
                resultObject.code = 6;
                resultObject.message = "이미지 등록에 오류입니다.";

                callback(true, resultObject);
              }


            }
          });

        });

      });



  });

};


function deleteS3Image(objects, callback){
  console.log("removeS3Images");

  var params = {
    Delete:{
      Objects: objects
    }
  };

  s3Bucket.deleteObjects(params, function(error, data){
    var resultObject = new Object({});

    if(error){
      console.log("deleteObjects error");
      console.log(error.stack);

      resultObject.code = 1;
      resultObject.message = "이미지 제거 오류입니다.";

      var errorTitle = errorPrefix + "deleteObjects error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      resultObject.code = 0;
      resultObject.message = "이미지 제거에 성공하였습니다.";

      resultObject.data = data;

      callback(null, resultObject);
    }
  });
}

exports.removeS3Images = function(objects, callback){
  console.log("removeS3Images");

  deleteS3Image(objects, function(error, result) {
    callback(error, result)
  });
};
