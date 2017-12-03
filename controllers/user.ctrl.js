
// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

var randomString = require('../js/random_string');

var async = require('async');

var dateFormat = require('dateformat');

var config = require('config.json')('./config/config.json');

var userModel = require('../models/user.model');

exports.checkDuplicate = function(email, callback){
  console.log("checkDuplicate");

  userModel.loadUser(email, function(error, userObject){
    var resultObject = new Object({});

    if(error){
      resultObject.code = 1;
      resultObject.message = "데이터베이스 에러입니다.";
    }else{

      var dataObject = new Object({});

      dataObject.email = email;
      if(userObject.length === 0){
        resultObject.code = 0;
        resultObject.message = "해당 e-mail은 사용 가능합니다.";
      }else{
        resultObject.code = 2;
        resultObject.message = "이미 등록된 e-mail입니다.";
      }

      resultObject.data = dataObject;

      callback(null, resultObject);
    }
  });
};

exports.signup = function(email, password, platformName, callback){
  userModel.signup(email, password, platformName, function(error, signupObject){
  	callback(error, signupObject);
  });
};

exports.withdraw = function(email, callback){
  userModel.withdraw(email, function(error, withdrawObject){
		callback(error, withdrawObject);
	});
};

exports.signin = function(email, password, platformName, callback){
	var resultObject = new Object({});
	var token = null;
	if(platformName === "kakao"){
		token = "kakao";
	}else{

	}

  var now = new Date();
  var today = dateFormat(now, "yyyymmdd");

  userModel.saveSigninData(email, today, function(error, resultSave){
    userModel.signin(email, password, platformName, token, function(error, signinObject){
  		callback(error, signinObject);
  	});
  });

};

exports.signout = function(email, callback){
  var now = new Date();
  var today = dateFormat(now, "yyyymmdd");

  userModel.saveSignoutData(email, today, function(error, resultSignout){
    var resultObject = new Object({});

    resultObject = resultSignout;

    var dataObject = new Object({});

    dataObject.email = email;
    dataObject.time = today;

    resultObject.data = dataObject;

		callback(error, resultObject);
	});
};

exports.signupAndSignin = function(email, password, confirm, callback){
  var resultObject = new Object({});

	var atCheck = email.indexOf("@");

  if(atCheck === -1){
		resultObject.code = 1;
    resultObject.message = "올바른 e-mail 형식이 아닙니다.";

		callback(null, resultObject);
	}else{
		if(password === confirm){
			userModel.loadUser(email, function(error, userObject){
				if(error){
					console.log("Error : ", error);
					resultObject.code = 3;
          resultObject.message = "데이터베이스 에러입니다.";

					callback(true, resultObject);
				}else{
					if(userObject.length > 0){
						// Already join
						resultObject.code = 4;
            resultObject.message = "이미 등록된 email입니다.";

						callback(null, resultObject);
					}else{
						// No same ID
						console.log("Create user data");

						userModel.signup(email, password, "local", function(error, resultSignup){
							if(error){
								console.log("signup error");

                resultObject.code = 5;
                resultObject.message = "데이터베이스 에러입니다.";

								callback(true, resultObject);
							}else{
								userModel.signin(email, password, "local", "", function(error, signinObject){
									if(error){
										console.log('Error : ', error);

                    resultObject.code = 6;
                    resultObject.message = "회원 가입에 성공하였습니다. 데이터베이스 오류입니다. 다시 로그인해주세요.";


										callback(true, resultObject);
									}else{
										if(signinObject.code == 0){
											// signin success
                      resultObject.code = 0;
                      resultObject.message = "로그인에 성공하였습니다.";

                      var accessToken = signinObject.data.accessToken;
                                    											var refreshToken = signinObject.data.refreshToken;

                      var dataObject = new Object({});

                      dataObject.email = email;
											dataObject.accessToken = accessToken;
											dataObject.refreshToken = refreshToken;

                      resultObject.data = dataObject;

											callback(null, resultObject);
										}else{
											// signin fail
                      resultObject.code = 7;
                      resultObject.message = "회원 가입에 성공하였습니다. 다시 로그인해주세요.";

											callback(null, resultObject);
										}

									}
								});
							}

						});
					}
				}

			});
		}else{
			resultObject.code = 2;
      resultObject.message = "입력하신 비밀번호가 다릅니다.";

			callback(null, resultObject);
		}
	}
};

exports.userMainRouting = function(email, callback){
  var resultObject = new Object({});

  userModel.loadUserState(email, function(error, resultState){
    var url = "";
    if(!resultState.data[0].info_check){
      url = "user/info";
    }else{
      if(!resultState.data[0].interest_check){
        url = "user/interest";
      }else{
        url = "user/main";
      }
    }

    resultObject.renderPage = url;

    callback(error, resultObject);
  });
};

exports.loadAllUser = function(callback){
  userModel.selectAllUser(function(error, resultUser){
    callback(error, resultUser);
  });
};

exports.loadUserInfo = function(email, callback){
  userModel.selectUserInfo(email, function(error, resultObject){
    callback(error, resultObject);
  });
};
