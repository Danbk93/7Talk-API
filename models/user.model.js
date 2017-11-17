
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

var mysql      = require('mysql');
var conn = mysql.createConnection({
  host     : config.rds.host,
  user     : config.rds.user,
  password : config.rds.password,
  database : config.rds.database
});

conn.connect();

var secretKey = config.jwt.secretKey;

var accessTokenExpireTime = '6h';
var refreshTokenExpireTime = '30d';

var saltRounds = 10;

var errorPrefix = "userModel/";

exports.duplicateCheck = function(email, callback){
  console.log("duplicateCheck");
  var resultObject = new Object({});

  resultObject.email = email;

  var sql = "SELECT user_id AS id, email_mn AS email, password_ln AS password FROM user WHERE email_mn = ?";

  var sqlParams = [email];

  conn.query(sql, sqlParams, function(error, result, fields){
    if(error){
      console.log("selectUser error");
      console.log(error);

      var errorTitle = errorPrefix + "selectUser error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      //console.log(result.length);
      if(result.length === 0){
        resultObject.duplicate = false;
      }else{
        resultObject.duplicate = true;
      }

      callback(null, resultObject);
    }
  });
};

// ex) platformName = facebook, google, twitter, kakao, local
function signup(email, password, platformName, callback){
  console.log("signup");
  var resultObject = new Object({});

  resultObject.email = email;

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

      conn.query(sql, sqlParams, function(error, resultPlatform, fields){
        if(error){
          console.log("select platform error");
          console.log(error);

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
          console.log("signup complete");

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
              insertInterest
            ], function(error, result){
              if(error){
                console.log("waterfall error");

                var sql = "ROLLBACK";

                conn.query(sql, function(error, resultRollback, fields){
                  console.log("rollback");

                  resultObject.signup = false;
                  resultObject.setting = false;
                  resultObject.information = false;
                  resultObject.interest = false;

                  callback(true, resultObject);
                });
              }else{
                console.log("waterfall");

                var sql = "COMMIT";

                conn.query(sql, function(error, resultCommit, fields){
                  console.log("commit");
                  console.log(resultCommit);
                  console.log(result);

                  resultObject.signup = true;
                  resultObject.setting = true;
                  resultObject.information = true;
                  resultObject.interest = true;
                  resultObject.insertId = userId;

                  callback(null, resultObject);
                });
              }
            });
          }else {
            var sql = "INSERT INTO interwork (user_id, platform_id) VALUE (?, ?)";

            var userId = results.user[0].id;

            var sqlParams = [userId, platformId];

            conn.query(sql, sqlParams, function(error, resultInterwork){
              resultObject.signup = true;

              callback(null, resultObject);
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

            conn.query(sql, sqlParams, function(error, resultUser, fields){
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

            conn.query(sql, sqlParams, function(error, resultInterwork, fields){
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

            conn.query(sql, sqlParams, function(error, resultData, fields){
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

            conn.query(sql, sqlParams, function(error, resultSetting, fields){
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

            var sql = "INSERT INTO user_information(user_id, update_dtm) VALUE (?, now())"

            var sqlParams = [Number(userId)];

            conn.query(sql, sqlParams, function(error, resultInformation, fields){
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

            conn.query(sql, sqlParams, function(error, resultInformation, fields){
              if(error){
                console.log("insertUserInterest error");
                console.log(error);

                var errorTitle = errorPrefix + "insertUserInterest error";

                errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
                  callback(true, error);
                });
              }else{
                callback(null, true);
              }
            });

          }

      }
    });

};

exports.signup = function(email, password, platformName, callback){
  signup(email, password, platformName, function(error, result){
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
    removeUser
  ], function(error, result){
    if(error){
      console.log("waterfall error");

      var sql = "ROLLBACK";

      conn.query(sql, function(error, resultRollback, fields){
        console.log("rollback");

        resultObject.withdraw = false;

        callback(true, resultObject);
      });
    }else{
      var sql = "COMMIT";

      conn.query(sql, function(error, resultRollback, fields){
        console.log("commit");

        resultObject.withdraw = true;

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

        var errorTitle = errorPrefix + "selectUserId error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        console.log(resultUserId);
        if(resultUserId.length === 0){
          console.log("No id");
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

        var errorTitle = errorPrefix + "selectInterworkId error";

        errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
          callback(true, error);
        });
      }else{
        if(resultInterwork.length === 0){
          console.log("No id");

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
  var expireTime = "0h";

  if(tokenType === "access_token"){
    expireTime = accessTokenExpireTime;
  }else if(tokenType === "refresh_token"){
    expireTime = refreshTokenExpireTime;
  }

  //console.log(expireTime);

  var token = jwt.sign({
    data: dataObject
  }, secretKey, { expiresIn: expireTime });

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

      resultObject.error = true;

      var errorTitle = errorPrefix + "selectUserJoinData error";

      errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
        callback(true, resultObject);
      });
    }else{
      resultObject.error = false;

      //console.log(result);
      //console.log("length : ", result.length);
      if(result.length === 0){
        // No id
        if(platformName === "local"){

          resultObject.emailCheck = false;
          resultObject.signin = false;
          resultObject.accessToken = null;
          resultObject.refreshToken = null;
          resultObject.role = null;


          callback(null, resultObject);
        }else if(platformName === "kakao"){
          console.log("kakao signup");

          password = randomString.randomString(7);

          signup(email, password, platformName, function(error, resultSingup){
            if(resultSingup.signup){
              resultObject.emailCheck = true;
              resultObject.signin = true;
              resultObject.accessToken = null;
              resultObject.refreshToken = null;
              resultObject.role = null;

              var tokenObject = new Object({});

              tokenObject.email = email;
              tokenObject.role = "user";

              changeSigninTime(email, function(error, resultUpdate){
                changeToken(email, "access_token", tokenObject, function(error, accessToken){
                  if(error){
                    console.log("changeAccessToken error");
                    console.log(error);

                    resultObject.accessToken = null;
                    resultObject.refreshToken = null;

                    var errorTitle = errorPrefix + "changeAccessToken error";

                    errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                      callback(true, resultObject);
                    });
                  }else{
                    console.log("accessToken : ", accessToken);

                    changeToken(email, "refresh_token", resultObject, function(error, refreshToken){
                      if(error){
                        console.log("changeRefreshToken error");
                        console.log(error);
                        resultObject.accessToken = accessToken;
                        resultObject.refreshToken = null;

                        var errorTitle = errorPrefix + "changeRefreshToken error";

                        errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                          callback(true, resultObject);
                        });
                      }else{
                        resultObject.accessToken = accessToken;
                        resultObject.refreshToken = refreshToken;

                        callback(null, resultObject);
                      }
                    });

                  }
                });
              });
            }else{
              resultObject.emailCheck = false;
              resultObject.signin = false;
              resultObject.accessToken = null;
              resultObject.refreshToken = null;
              resultObject.role = null;

              callback(true, resultObject);
            }

          });
        }

      }else{
        // ID ok
        resultObject.emailCheck = true;
        if(platformName === "local"){
          bcrypt.compare(password, result[0].password, function(error, resultCompare){
            if(error){
              console.log("compare error");
              resultObject.error = true;
              resultObject.signin = false;
              resultObject.accessToken = null;
              resultObject.refreshToken = null;
              resultObject.role = null;

              var errorTitle = errorPrefix + "compare error";

              errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                callback(true, resultObject);
              });
            }else{
              //console.log(resultCompare);
              if(resultCompare){
                // Matching password
                resultObject.signin = true;
                resultObject.role = result[0].role;

                var tokenObject = new Object({});

                tokenObject.email = email;
                tokenObject.role = result[0].role;

                //var userId = resultCompare.userId;

                changeSigninTime(email, function(error, resultUpdate){
                  changeToken(email, "access_token", tokenObject, function(error, accessToken){
                    if(error){
                      console.log("changeAccessToken error");
                      console.log(error);
                      resultObject.accessToken = null;
                      resultObject.refreshToken = null;

                      var errorTitle = errorPrefix + "changeAccessToken error";

                      errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                        callback(true, resultObject);
                      });
                    }else{
                      console.log("accessToken : ", accessToken);

                      changeToken(email, "refresh_token", resultObject, function(error, refreshToken){
                        if(error){
                          console.log("changeRefreshToken error");
                          console.log(error);
                          resultObject.accessToken = accessToken;
                          resultObject.refreshToken = null;

                          var errorTitle = errorPrefix + "changeRefreshToken error";

                          errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                            callback(true, resultObject);
                          });
                        }else{
                          resultObject.accessToken = accessToken;
                          resultObject.refreshToken = refreshToken;

                          callback(null, resultObject);
                        }
                      });

                    }
                  });
                });


              }else{
                console.log("Wrong password");
                // Wrong password
                resultObject.signin = false;
                resultObject.role = null;
                resultObject.accessToken = null;
                resultObject.refreshToken = null;

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

            resultObject.signin = true;
            resultObject.error = false;

            //console.log(email);

            // TODO Modify request kakao api

            changeSigninTime(email, function(error, resultUpdate){
              changeToken(email, "access_token", tokenObject, function(error, accessToken){
                if(error){
                  console.log("changeAccessToken error");
                  console.log(error);
                  resultObject.accessToken = null;
                  resultObject.refreshToken = null;

                  var errorTitle = errorPrefix + "changeAccessToken error";

                  errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                    callback(true, resultObject);
                  });
                }else{
                  console.log("accessToken : ", accessToken);

                  changeToken(email, "refresh_token", resultObject, function(error, refreshToken){
                    if(error){
                      console.log("changeRefreshToken error");
                      console.log(error);
                      resultObject.accessToken = accessToken;
                      resultObject.refreshToken = null;

                      var errorTitle = errorPrefix + "changeRefreshToken error";

                      errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
                        callback(true, resultObject);
                      });
                    }else{
                      resultObject.accessToken = accessToken;
                      resultObject.refreshToken = refreshToken;

                      callback(null, resultObject);
                    }
                  });

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
  var resultObject = new Object({});

  bcrypt.genSalt(saltRounds, function(error, salt){
    if(error){
      console.log("genSalt error");
      console.log(error);

      resultObject.email = email;
      resultObject.change = false;

      var errorTitle = errorPrefix + "salt error";

      errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
        callback(true, resultObject);
      });
    }else{
      bcrypt.hash(password, salt, function(error, hash){
        var sql = "UPDATE user SET password_ln = ? WHERE email_mn = ?";

        var sqlParams = [hash, email];

        conn.query(sql, sqlParams, function(error, result, fields){
          resultObject.email = email;

          if(error){
            console.log("update password error");
            resultObject.change = false;

            var errorTitle = errorPrefix + "update password error";

            errorModel.reportErrorLog(null, errorTitle, error.stack, function(error, result){
              callback(true, resultObject);
            });
          }else{
            resultObject.change = true;

            callback(null, resultObject);
          }
        });

      });
    }
  });
};

exports.signout = function(email, callback){
  var now = new Date();
  var today = dateFormat(now, "yyyymmdd");

  console.log(email, "is signout ", today);

  callback(null, true);
};

exports.signinToday = function(email, callback){
  var now = new Date();
  var today = dateFormat(now, "yyyymmdd");

  console.log(email + " is signin", today);

  callback(null, true);
};


exports.findPassword = function(email, callback){
  //console.log("findPassword");
  var cipher = 6;
  var randomPassword = randomString.randomString(cipher);

  console.log("randomPassword : ", randomPassword);

  this.changePassword(email, randomPassword, function(error, result){
    //console.log("changePassword");
    callback(error, result);
  });
};

exports.checkToken = function checkToken(token, callback){
  var resultObject = new Object({});

  //console.log(token);

  jwt.verify(token, secretKey, function(error, decoded) {
    if(error){
      console.log("verify error");
      //console.log(decoded);
      //resultObject = decoded.data;

      resultObject.signin = false;

      var errorTitle = errorPrefix + "verify error";

      errorModel.reportErrorLog(null, errorTitle, error, function(error, result){
        callback(true, resultObject);
      });
    }else{
      console.log("decoded data : ", Object.keys(decoded.data));
      //console.log("data : " + decoded.data);

      resultObject.data = decoded.data;

      resultObject.signin = true;

      callback(null, resultObject);

    }
  });
};

function changeToken(email, tokenType, dataObject, callback){
  console.log("changeToken : ", tokenType);
  var expireTime = "0h";

  if(tokenType === "access_token"){
    expireTime = accessTokenExpireTime;
  }else if(tokenType === "refresh_token"){
    expireTime = refreshTokenExpireTime;
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


exports.loadAllUser =  function(callback){
  var sql = "SELECT user_id AS userId, email_mn AS email, update_pw_dtm AS updatePWTime FROM user";

  var sqlParams = [];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};

exports.loadUserState = function(email, callback){
  var sql = "SELECT email_mn, info_check, interest_check FROM user AS u, user_information AS uinf, user_interest AS uint WHERE u.email_mn = ? AND u.user_id = uinf.user_id AND u.user_id = uint.user_id"

  var sqlParams = [email];

  queryModel.request("select", modelLog, sql, sqlParams, function(error, resultObject){
    callback(error, resultObject);
  });
};
