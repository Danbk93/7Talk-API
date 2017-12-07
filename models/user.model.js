
// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

var randomString = require('../js/random_string');

var async = require('async');

var config = require('config.json')('./config/config.json');

var dateFormat = require('dateformat');

var modelLog = "User";
var errorModel = require('./error.model');

var queryModel = require('./query.model');

var heartModel = require('./heart.model');

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

var secretKey = config.jwt.secretKey;

var accessTokenExpire = '6h';

var saltRounds = 10;

var errorPrefix = "userModel/";

exports.loadUser = function(email, callback){
  console.log("loadUser");
  var resultObject = new Object({});

  var sql = "SELECT user_id AS id, email_mn AS email FROM user WHERE email_mn = ?";

  var sqlParams = [email];

  conn.query(sql, sqlParams, function(error, resultObject){
    if(error){
      console.log("selectUser error");
      console.log(error);

      var errorTitle = errorPrefix + "selectUser error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      callback(null, resultObject);
    }
  });
};

// ex) platformName = facebook, google, twitter, kakao, local
function signup(inputObject, platformName, callback){
  console.log("signup");

  console.log(inputObject);

  var email = inputObject.email;
  var password = inputObject.password;

  var nickname = inputObject.name;
  var sex = inputObject.sex;
  var birthday = inputObject.birthday;

  var resultObject = new Object({});

  async.parallel({
    user : function(callback){
      var sql = "SELECT user_id AS id FROM user WHERE email_mn = ?";

      var sqlParams = [email];

      conn.query(sql, sqlParams, function(error, resultUser, fields){
        if(error){
          console.log("select User error");
          console.log(error);

          var errorTitle = errorPrefix + "select User error";

          errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
            callback(true, error);
          });
        }else{
          callback(null, resultUser);
        }
      });
    },
    platform : function(callback){
      var sql = "SELECT platform_id AS id FROM platform WHERE name_sn = ?";

      var sqlParams = [platformName];

      conn.query(sql, sqlParams, function(error, resultPlatform){
        if(error){
          console.log("select platform error");
          console.log(error);

          resultObject.code = 1;

          var errorTitle = errorPrefix + "select platform error";

          errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
            callback(true, error);
          });
        }else{
          callback(null, resultPlatform);
        }
      });
    },
    authorization : function(callback){
      var sql = "SELECT authorization_id AS id FROM authorization WHERE name_sn = ?";

      var authName = "user";

      var sqlParams = [authName];

      conn.query(sql, sqlParams, function(error, resultAuthorization, fields){
        if(error){
          console.log("select auth error");
          console.log(error);

          resultObject.code = 2;

          var errorTitle = errorPrefix + "select auth error";

          errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
            callback(true, error);
          });
        }else{
          callback(null, resultAuthorization);
        }
      });
    },
    salt : function(callback){
      bcrypt.genSalt(saltRounds, function(error, resultSalt){
        if(error){
          console.log("salt error");
          console.log(error);

          resultObject.code = 3;

          var errorTitle = errorPrefix + "salt error";

          errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
            callback(true, error);
          });
        }else{
          callback(null, resultSalt);
        }
      });
    }
  }, function(error, results) {
      if (error) {
          console.log("signup error");

          console.log(error);

          var errorTitle = errorPrefix + "signup error";

          errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
            callback(true, error);
          });
      } else {
          //console.log("signup complete");

          var userId = -1;

          var userCheck = true;
          if(results.user.length > 0){
            userCheck = false;
          }

          const platformId = results.platform[0].id;
          const authorizationId = results.authorization[0].id;
          const salt = results.salt;

          if(userCheck){
            async.waterfall([
              transaction,
              bcrypt.hash,
              insertUser,
              insertRole,
              insertInterwork,
              insertInterworkingData,
              insertSetting,
              insertInformation,
              insertInterest,
              insertHeart
            ], function(error, result){
              if(error){
                console.log("waterfall error");

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
                  resultObject.message = "회원가입에 성공하였습니다.";

                  callback(null, resultObject);
                });
              }
            });
          }else {
            var sql = "SELECT interwork_id AS id FROM interwork WHERE user_id = ? AND platform_id = ?";

            var userId = results.user[0].id;

            var sqlParams = [userId, platformId];

            conn.query(sql, sqlParams, function(error, resultSelect){
              if(resultSelect.length > 0){
                resultObject.code = 1;
                resultObject.message = "이미 등록되어 있는 아이디입니다.";

                callback(null, resultObject);
              }else{
                var sql = "INSERT INTO interwork (user_id, platform_id) VALUE (?, ?)";

                var userId = results.user[0].id;

                var sqlParams = [userId, platformId];

                conn.query(sql, sqlParams, function(error, resultInterwork){
                  resultObject.code = 0;
                  resultObject.message = "email 연동에 성공하였습니다.";

                  callback(null, resultObject);
                });
              }
            });


          }

          function transaction(callback){
            var sql = "START TRANSACTION";

            conn.query(sql, function(error, resultTransaction, fields){
              console.log("startTransaction");
              if(error){
                console.log("transaction error");
                //TODO modify callback
                callback(true, null, null);
              }else{
                //console.log(result);
                callback(null, password, salt);
              }
            });
          }

          function insertUser(hash, callback){
            console.log("insertUser");

            var sql = "INSERT INTO user (email_mn, password_ln) VALUE (?, ?)";

            var sqlParams = [email, hash];

            conn.query(sql, sqlParams, function(error, resultUser){
              if(error){
                console.log("insertUser error");
                console.log(error);

                var errorTitle = errorPrefix + "insertUser error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{

                userId = resultUser.insertId;

                callback(null, userId);
              }
            });
          }

          function insertRole(userId, callback){
            console.log("insertRole");

            var sql = "INSERT INTO role (user_id, authorization_id) VALUE (?, ?)";

            var sqlParams = [userId, Number(authorizationId)];

            conn.query(sql, sqlParams, function(error, resultRole, fields){
              if(error){
                console.log("insertRole error");
                console.log(error);

                var errorTitle = errorPrefix + "insertRole error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{
                callback(null, userId);
              }
            });
          }

          function insertInterwork(userId, callback){
            console.log("insertInterwork");

            var sql = "INSERT INTO interwork (user_id, platform_id) VALUE (?, ?)";

            var sqlParams = [userId, Number(platformId)];

            conn.query(sql, sqlParams, function(error, resultInterwork){
              if(error){
                console.log("insertInterwork error");
                console.log(error);

                var errorTitle = errorPrefix + "insertInterwork error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{
                var interworkId = resultInterwork.insertId;

                callback(null, userId, interworkId);
              }
            });
          }

          function insertInterworkingData(userId, interworkId, callback){
            console.log("insertInterworkingData");

            var sql = "INSERT INTO interworking_data (interwork_id, email_mn, nickname_sn, profile_path_ln) VALUE (?, ?, ?, ?)";

            var sqlParams = [interworkId, email, "", ""];

            conn.query(sql, sqlParams, function(error, resultData){
              if(error){
                console.log("insertInterworkingData error");
                console.log(error);

                var errorTitle = errorPrefix + "insertInterworkingData error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{

                callback(null, userId);
              }
            });
          }

          function insertSetting(userId, callback){
            console.log("insertSetting");

            var sql = "INSERT INTO user_setting (user_id, notification_check, alert_check, event_check, matching_check, dialog_check, update_dtm) VALUE (?, true, true, true, false, true, NOW())";

            var sqlParams = [Number(userId)];

            conn.query(sql, sqlParams, function(error, resultSetting){
              if(error){
                console.log("insertUserSetting error");
                console.log(error);

                var errorTitle = errorPrefix + "insertUserSetting error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{
                callback(null, userId);
              }
            });
          }

          function insertInformation(userId, callback){
            console.log("insertInformation");

            var sql = "INSERT INTO user_information(user_id, nickname_sn, sex_sn, birthday_dt, update_dtm) VALUE (?, ?, ?, ?, now())"

            var sqlParams = [Number(userId), nickname, sex, birthday];

            conn.query(sql, sqlParams, function(error, resultInformation){
              if(error){
                console.log("insertUserInformation error");
                console.log(error);

                var errorTitle = errorPrefix + "insertUserInformation error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{
                callback(null, userId);
              }
            });
          }

          function insertInterest(userId, callback){
            console.log("insertInterest");

            var sql = "INSERT INTO user_interest(user_id, update_dtm) VALUE (?, NOW())";

            var sqlParams = [Number(userId)];

            conn.query(sql, sqlParams, function(error, resultInterest){
              if(error){
                console.log("insertUserInterest error");
                console.log(error);

                var errorTitle = errorPrefix + "insertUserInterest error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{
                callback(null, userId);
              }
            });

          }

          function insertHeart(userId, callback) {
            var sql = "INSERT INTO heart (user_id, heart_n) VALUE (?, 0)";

            var sqlParams = [Number(userId)];

            conn.query(sql, sqlParams, function(error, resultHeart){
              if(error){
                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{
                //console.log(resultHeart);
                callback(null, true);
              }
            });

          }

          // End function set
      }
    });

}

exports.signup = function(inputObject, platformName, callback){
  signup(inputObject, platformName, function(error, result){
    callback(error, result);
  });
};


exports.withdraw = function(email, callback){
  console.log("withdraw");
  var resultObject = new Object({});

  async.waterfall([
    transaction,
    findUserId,
    removeSetting,
    removeInterest,
    removeInformation,
    removeRole,
    findInterworkId,
    removeInterworkingData,
    removeInterwork,
    removeHeart,
    removeUser
  ], function(error, result){
    if(error){
      console.log("waterfall error");

      var sql = "ROLLBACK";

      conn.query(sql, function(error, resultRollback, fields){
        console.log("rollback");

        callback(true, resultObject);
      });
    }else{
      var sql = "COMMIT";

      conn.query(sql, function(error, resultRollback, fields){
        console.log("commit");

        resultObject.code = 0;
        resultObject.message = "해당 아이디가 탈퇴 처리되었습니다.";

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
        //TODO modify callback

        resultObject.code = 1;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        callback(true);
      }else{
        console.log(resultTransaction);
        callback(null);
      }
    });
  }

  function findUserId(callback){
    console.log("findUserId");

    var sql = "SELECT user_id AS id FROM user WHERE email_mn = ?";

    var sqlParams = [email];

    conn.query(sql, sqlParams, function(error, resultUserId, fields){
      if(error){
        console.log("selectUserId error");
        console.log(error);

        resultObject.code = 2;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = errorPrefix + "selectUserId error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        console.log(resultUserId);
        if(resultUserId.length === 0){
          console.log("No id");

          resultObject.code = 3;
          resultObject.message = "해당 아이디가 존재하지 않습니다.";

          callback(true, true);
        }else{
          var userId = resultUserId[0].id;

          callback(null, userId);
        }
      }
    });
  }

  function removeSetting(userId, callback){
    console.log("removeSetting");

    var sql = "DELETE FROM user_setting WHERE user_id = ?";

    var sqlParams = [Number(userId)];

    conn.query(sql, sqlParams, function(error, resultSetting, fields){
      if(error){
        console.log("deleteUserSetting error");
        console.log(error);

        resultObject.code = 4;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = errorPrefix + "deleteUserSetting error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, userId);
      }
    });
  }

  function removeInterest(userId, callback){
    console.log("removeInterest");

    var sql = "DELETE FROM user_interest WHERE user_id = ?";

    var sqlParams = [Number(userId)];

    conn.query(sql, sqlParams, function(error, resultDelete, fields){
      if(error){
        console.log("deleteUserInterest error");
        console.log(error);

        resultObject.code = 5;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = errorPrefix + "deleteUserInterest error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, userId);
      }
    });
  }

  function removeRole(userId, callback){
    console.log("removeRole");

    var sql = "DELETE FROM role WHERE user_id = ?";

    var sqlParams = [Number(userId)];

    conn.query(sql, sqlParams, function(error, resultRole, fields){
      if(error){
        console.log("deleteRole error");
        console.log(error);

        resultObject.code = 6;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = errorPrefix + "deleteRole error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, userId);
      }
    });
  }

  function findInterworkId(userId, callback){
    console.log("findInterworkId");

    var sql = "SELECT interwork_id AS id FROM interwork WHERE user_id = ?";

    var sqlParams = [userId];

    conn.query(sql, sqlParams, function(error, resultInterwork, fields){
      if(error){
        console.log("selectInterworkId error");
        console.log(error);

        resultObject.code = 7;
        resultObject.message = "데이터베이스 오류입니다. 다시 시도해주세요.";

        var errorTitle = errorPrefix + "selectInterworkId error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        if(resultInterwork.length === 0){
          console.log("No id");

          resultObject.code = 8;
          resultObject.message = "해당 아이디가 존재하지 않습니다.";

          var errorTitle = errorPrefix + "No id error";

          errorModel.reportErrorLog(null, errorTitle, "No id", function(error, result){
            callback(true, error);
          });
        }else{
          var interworkIdArray = [];

          for(var i = 0; i < resultInterwork.length; i++){
            interworkIdArray.push(resultInterwork[i].id);
          }

          //console.log(interworkIdArray);

          callback(null, userId, interworkIdArray);
        }
      }
    });
  }

  function removeInterworkingData(userId, interworkIdArray, callback){
    console.log("removeInterworkingData");

    var sql = "DELETE FROM interworking_data WHERE interwork_id IN (?)";

    var sqlParams = [interworkIdArray];

    conn.query(sql, sqlParams, function(error, resultData, fields){
      if(error){
        console.log("removeInterworkingData error");
        console.log(error);

        var errorTitle = errorPrefix + "removeInterworkingData error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, userId);
      }
    });
  }

  function removeInterwork(userId, callback){
    console.log("removeInterwork");

    var sql = "DELETE FROM interwork WHERE user_id = ?";

    var sqlParams = [Number(userId)];

    conn.query(sql, sqlParams, function(error, resultInterwork, fields){
      if(error){
        console.log("deleteInterwork error");
        console.log(error);

        var errorTitle = errorPrefix + "deleteInterwork error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, userId);
      }
    });
  }


  function removeInformation(userId, callback){
    console.log("removeInformation");

    var sql = "DELETE FROM user_information WHERE user_id = ?";

    var sqlParams = [Number(userId)];

    conn.query(sql, sqlParams, function(error, resultInformation, fields){
      if(error){
        console.log("deleteUserInformation error");
        console.log(error);

        var errorTitle = errorPrefix + "deleteUserInformation error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, userId);
      }
    });
  }

  function removeHeart(userId, callback) {
    heartModel.deleteHeart(userId, function(error, result){
      if(error){
        var errorTitle = errorPrefix + "deleteHeart error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, userId);
      }
    });
  }

  function removeUser(userId, callback){
    console.log("removeUser");

    var sql = "DELETE FROM user WHERE user_id = ?";

    var sqlParams = [Number(userId)];

    conn.query(sql, sqlParams, function(error, resultInformation, fields){
      if(error){
        console.log("deleteUser error");
        console.log(error);

        var errorTitle = errorPrefix + "deleteUser error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        callback(null, true);
      }
    });
  }

};

function changeToken(email, tokenType, dataObject, callback){
  console.log("changeToken : ", tokenType);
  var expire = "0h";
  var now = new Date();
  var expireTime;

  console.log();

  if(tokenType === "access_token"){

    expire = accessTokenExpire;
  }



  //console.log(expireTime);

  var token = jwt.sign({
    data: dataObject
  }, secretKey, { expiresIn: expire });

  callback(null, token);
}



exports.signin = function(email, password, platformName, token, callback){
  var resultObject = new Object({});

  resultObject.email = email;

  var sql = "SELECT u.user_id AS id, u.email_mn AS email, u.password_ln AS password, a.name_sn AS role, p.name_sn AS platform FROM user AS u, role AS r, authorization AS a, interwork AS i, platform AS p WHERE u.user_id = r.user_id AND r.authorization_id = a.authorization_id AND u.user_id = i.user_id AND i.platform_id = p.platform_id AND email_mn = ? AND p.name_sn = ?";

  var sqlParams = [email, platformName];

  conn.query(sql, sqlParams, function(error, result, fields){
    if(error){
      console.log("selectUserJoinData error");
      console.log(error);

      resultObject.code = 1;
      resultObject.message = "데이터베이스 에러입니다.";

      var errorTitle = errorPrefix + "selectUserJoinData error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      if(result.length === 0){
        // No id
        if(platformName === "local"){

          resultObject.code = 2;
          resultObject.message = "해당 유저가 없습니다. e-mail을 다시 확인해주세요.";

          callback(null, resultObject);
        }else if(platformName === "kakao"){
          console.log("kakao signup");

          password = randomString.randomString(7);

          var userObject = new Object({});

          userObject.email = email;
          userObject.password = password;

          signup(userObject, platformName, function(error, resultSingup){
            if(resultSingup.code === 0){
              var tokenObject = new Object({});

              tokenObject.email = email;
              tokenObject.role = "user";

              changeSigninTime(email, function(error, resultUpdate){
                changeToken(email, "access_token", tokenObject, function(error, accessToken){
                  if(error){
                    console.log("changeAccessToken error");
                    console.log(error);

                    resultObject.code = 3;
                    resultObject.message = "엑세스 토큰 설정에 실패하였습니다. 다시 시도해주세요.";

                    var errorTitle = errorPrefix + "changeAccessToken error";

                    errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                      callback(true, resultObject);
                    });
                  }else{
                    console.log("accessToken : ", accessToken);

                    resultObject.code = 0;
                    resultObject.message = "회원가입에 성공하였습니다.";

                    var dataObject = new Object({});

                    dataObject.email = email;
                    dataObject.accessToken = accessToken;

                    resultObject.data = dataObject;

                    callback(null, resultObject);

                  }
                });
              });
            }else{
              resultObject.code = 6;
              resultObject.message = "회원가입에 실패하였습니다.";

              callback(true, resultObject);
            }

          });
        }

      }else{
        // ID ok
        if(platformName === "local"){
          bcrypt.compare(password, result[0].password, function(error, resultCompare){
            if(error){
              console.log("compare error");
              resultObject.code = 7;
              resultObject.message = "서버 오류입니다. 다시 시도해주세요.";

              var errorTitle = errorPrefix + "compare error";

              errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                callback(true, resultObject);
              });
            }else{
              //console.log(resultCompare);
              if(resultCompare){
                // Matching password

                var tokenObject = new Object({});

                tokenObject.email = email;
                tokenObject.role = result[0].role;

                //var userId = resultCompare.userId;

                changeSigninTime(email, function(error, resultUpdate){
                  changeToken(email, "access_token", tokenObject, function(error, accessToken){
                    if(error){
                      console.log("changeAccessToken error");
                      console.log(error);

                      resultObject.code = 8;
                      resultObject.message = "엑세스 토큰 설정에 실패하였습니다. 다시 시도해주세요.";

                      var dataObject = new Object({});

                      dataObject.email = email;
                      dataObject.accessToken = null;

                      resultObject.data = dataObject;

                      var errorTitle = errorPrefix + "changeAccessToken error";

                      errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                        callback(true, resultObject);
                      });
                    }else{
                      console.log("accessToken : ", accessToken);

                      resultObject.code = 0;
                      resultObject.message = "로그인에 성공하였습니다.";

                      var dataObject = new Object({});

                      dataObject.email = email;
                      dataObject.accessToken = accessToken;

                      resultObject.data = dataObject;

                      callback(null, resultObject);

                    }
                  });
                });


              }else{
                console.log("Wrong password");
                // Wrong password
                resultObject.code = 10;
                resultObject.message = "비밀번호가 다릅니다. 다시 시도해주세요.";

                callback(null, resultObject);
              }
            }
          });
        }else if(platformName === "kakao"){
          console.log("check");
          if(token === "kakao"){
            console.log("in");
            var tokenObject = new Object({});

            tokenObject.email = email;
            tokenObject.role = "user";

            // TODO Modify request kakao api

            changeSigninTime(email, function(error, resultUpdate){
              changeToken(email, "access_token", tokenObject, function(error, accessToken){
                if(error){
                  console.log("changeAccessToken error");
                  console.log(error);
                  resultObject.code = 11;
                  resultObject.message = "토큰 오류입니다. 다시 시도해주세요.";

                  var errorTitle = errorPrefix + "changeAccessToken error";

                  errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                    callback(true, resultObject);
                  });
                }else{
                  console.log("accessToken : ", accessToken);

                  resultObject.code = 0;
                  resultObject.message = "로그인에 성공하였습니다.";

                  var dataObject = new Object({});

                  dataObject.email = email;
                  dataObject.accessToken = accessToken;

                  resultObject.data = dataObject;

                  callback(null, resultObject);

                }
              });
            });
          }

        }

      }
    }
  });
};


exports.changePassword = function changePassword(email, password, callback){
  bcrypt.genSalt(saltRounds, function(error, salt){
    var resultObject = new Object({});

    if(error){
      console.log("genSalt error");
      console.log(error);

      resultObject.code = 1;
      resultObject.message = "서버 오류입니다. 다시 시도해주세요.";

      var errorTitle = errorPrefix + "salt error";

      errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
        callback(true, resultObject);
      });
    }else{
      bcrypt.hash(password, salt, function(error, hash){
        var sql = "UPDATE user SET password_ln = ? WHERE email_mn = ?";

        var sqlParams = [hash, email];

        conn.query(sql, sqlParams, function(error, result, fields){
          if(error){
            console.log("update password error");

            resultObject.code = 2;
            resultObject.message = "서버 오류입니다. 다시 시도해주세요.";


            var errorTitle = errorPrefix + "update password error";

            errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
              callback(true, resultObject);
            });
          }else{
            resultObject.code = 0;
            resultObject.message = "비밀번호 변경에 성공하였습니다.";

            callback(null, resultObject);
          }
        });

      });
    }
  });
};

exports.saveSignoutData = function(email, time, callback){
  var resultObject = new Object({});

  console.log(email, "is signout ");

  resultObject.code = 0;
  resultObject.message = email + " is signout " + time;

  callback(null, resultObject);
};

exports.saveSigninData = function(email, time, callback){
  var resultObject = new Object({});

  console.log(email + " is signin ", time);

  resultObject.code = 0;
  resultObject.message = email + " is signin " + time;

  callback(null, resultObject);
};


exports.findPassword = function(email, callback){
  console.log("findPassword");
  var resultObject = new Object({});

  var cipher = 6;
  var randomPassword = randomString.randomString(cipher);

  console.log("randomPassword : ", randomPassword);

  this.changePassword(email, randomPassword, function(error, result){
    resultObject.code = 0;
    resultObject.message = "서버 오류입니다. 다시 시도해주세요.";

    var dataObject = new Object({});

    dataObject.email = email;
    dataObject.password = randomPassword;

    resultObject.data = dataObject;

    callback(error, resultObject);
  });
};

exports.checkToken = function checkToken(token, callback){
  var resultObject = new Object({});

  //console.log(token);

  jwt.verify(token, secretKey, function(error, decoded) {
    if(error){
      console.log("verify error");
      //console.log(decoded);
      resultObject.code = 1;
      resultObject.message = "알 수 없는 토큰 형식입니다.";

      var errorTitle = errorPrefix + "verify error";

      errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
        callback(true, resultObject);
      });
    }else{
      console.log("decoded data : ", Object.keys(decoded.data));
      resultObject.code = 0;
      resultObject.message = "토큰 인증에 성공했습니다.";

      var dataObject = new Object({});

      dataObject.data = decoded.data;

      resultObject.data = dataObject;

      callback(null, resultObject);

    }
  });
};

function changeToken(email, tokenType, dataObject, callback){
  console.log("changeToken : ", tokenType);
  var expireTime = "0h";

  if(tokenType === "access_token"){
    expireTime = accessTokenExpire;
  }
  //console.log(expireTime);

  var token = jwt.sign({
    data: dataObject
  }, secretKey, { expiresIn: expireTime });

  callback(null, token);
}

exports.changeUserToken = function(email, tokenType, dataObject, callback){
  changeToken(email, tokenType, dataObject, function(error, result){
    callback(error, result);
  });
};

function changeSigninTime(email, callback){
  console.log("changeSigninTime");

  callback(null, true);

}


exports.selectAllUser =  function(callback){
  var sql = "SELECT user_id AS userId, email_mn AS email, update_pw_dtm AS updatePWTime FROM user";

  var sqlParams = [];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};


/*
  Interest table
*/
exports.loadOthersInterest = function(email, callback){
  var sql = "select email_mn AS email, q.content_mn AS question, q.question_id AS questionId, ae.answer_mn As answer, ae.answer_example_id AS answerId from user AS u, answer AS a, answer_example AS ae, question AS q where u.user_id = a.user_id AND a.answer_example_id = ae.answer_example_id AND ae.question_id = q.question_id AND u.email_mn != ? ORDER BY u.user_id, a.answer_id";

  var sqlParams = [email];

  conn.query(sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

exports.loadUserInterest = function(email, callback){
  var sql = "select email_mn AS email, q.content_mn AS question, q.question_id AS questionId, ae.answer_mn As answer, ae.answer_example_id AS answerId from user AS u, answer AS a, answer_example AS ae, question AS q where u.user_id = a.user_id AND a.answer_example_id = ae.answer_example_id AND ae.question_id = q.question_id AND u.email_mn  = ? ORDER BY u.user_id, a.answer_id";

  var sqlParams = [email];

  conn.query(sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

/*
  Info table
*/
exports.selectUserInfo = function(email, callback){
  var sql = "SELECT email_mn AS email, name_sn AS name, nickname_sn AS nickname, sex_sn AS sex, age_n AS age, birthday_dt AS birthday, location_ln AS location, phone_number_sn AS phoneNum, introduction_mn AS introduction, update_dtm AS updateTime, profile_path_ln AS profilePath, kakao_id_sn AS kakaoId, info_check AS infoCheck FROM user_information AS ui, user AS u WHERE ui.user_id = u.user_id AND u.email_mn = ?";

  var sqlParams = [email];

  conn.query(sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

exports.updateUserInfo = function(email, name, sex, birthday, age, address, phoneNum, introduction, callback){
  var sql = "UPDATE user_information SET name_sn = ?, sex_sn = ?, birthday_dt = ?, age_n = ?, location_ln = ?, phone_number_sn = ?, introduction_mn = ? WHERE user_id = (SELECT user_id FROM user WHERE email_mn = ?)";

  var sqlParams = [name, sex, birthday, age, address, phoneNum, introduction, email];

  conn.query(sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};



exports.getUserInterestState = function(email, callback){
  var resultObject = new Object({});

  var key = email + "/interest/state";

  redisClient.get(key, function(error, result){
    var dataObject = new Object({});

    dataObject.result = result;

    resultObject.code = 0;
    resultObject.data = dataObject;

    callback(null, resultObject);
  });
};


function setUserInterestState(email, pageId, callback){
  var resultObject = new Object({});

  var key = email + "/interest/state";

  var value = Number(pageId) + 1;

  console.log(key, value);

  redisClient.set(key, value, function(error, result){
    var dataObject = new Object({});

    dataObject.result = result;

    resultObject.code = 0;
    resultObject.data = dataObject;

    callback(null, resultObject);
  });
}

exports.updateUserInterest = function(email, answerArray, pageId, callback){
  console.log("updateUserInterest");
  var resultObject = new Object({});

  setUserInterestState(email, pageId, function(error, result){
    insertAnswer(email, answerArray, pageId, function(error, result){
      callback(null, result);
    });
  });
};

function insertAnswer(email,  answerArray, page, callback){
  console.log("insertAnswer");
  var idx = -1;
  if(page == 1){
    idx = 0;
  }else{
    idx = 5;
  }

  var sql = "SELECT user_id AS userId FROM user WHERE email_mn = ?";

  var sqlParams = [email];
  var userId = -1;

  conn.query(sql, sqlParams, function(error, userObject){
    console.log(userObject);

    if(userObject.length > 0){

      userId = userObject[0].userId;

      console.log(userId);

      sql = "INSERT INTO answer (user_id, answer_example_id) VALUES ?";

      sqlParams = [];

      for(var i = 0; i < 5; i++){
        var list = [];

        list.push(userId);
        list.push(answerArray[i]);

        sqlParams.push(list);
      }
      console.log(sqlParams);

      conn.query(sql, [sqlParams], function(error, result){
        console.log(error);
        console.log(result);

        var pageId = Number(result);

        callback(null, pageId);
      });
    }else{
      callback(null, 0);
    }



  });




}
