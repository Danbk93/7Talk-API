
var userModel = require('../models/user.model');


exports.signup = function(email, password, platformName, callback){
  userModel.signup(email, password, "local", function(error, signupObject){
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

	userModel.signin(email, password, platformName, token, function(error, signinObject){
		callback(error, signinObject);
	});

};

exports.signout = function(email, callback){
  userModel.signout(email, function(error, resultSignout){
		callback(error, resultSignout);
	});
};

exports.signupAndSignin = function(email, password, confirm, callback){
  var resultObject = new Object({});

	var atCheck = email.indexOf("@");

  if(atCheck === -1){
		resultObject.atCheck = false;

		callback(null, resultObject);
	}else{
		resultObject.atCheck = true;
		if(password === confirm){
			resultObject.confirm = true;
			userModel.duplicateCheck(email, function(error, duplicateObject){
				if(error){
					console.log("Error : ", error);
					resultObject.error = true;

					callback(true, resultObject);
				}else{
					resultObject.error = false;

					if(duplicateObject.duplicate){
						// Already join
						resultObject.duplicate = true;

						callback(null, resultObject);
					}else{
						// No same ID
						resultObject.duplicate = false;
						console.log("Create user data");

						userModel.signup(email, password, "local", function(error, resultSignup){
							if(error){
								resultObject.error = true;
								console.log("signup error");

								resultObject.signup = false;

								res.json(resultObject);
							}else{
								//console.log("check1");
								resultObject.signup = true;

								userModel.signin(email, password, "local", "", function(error, signinObject){
									if(error){
										console.log('Error : ', error);
										resultObject.error = true;
										resultObject.signin = false;

										res.json(resultObject);
									}else{
										//console.log("check2");
										resultObject.error = false;
										if(signinObject.signin){
											// signin success
											resultObject.signin = true;
											var accessToken = signinObject.accessToken;
											var refreshToken = signinObject.refreshToken;

											resultObject.accessToken = accessToken;
											resultObject.refreshToken = refreshToken;


											//console.log(resultObject);

											callback(null, resultObject);
										}else{
											// signin fail
											resultObject.signin = false;

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
			resultObject.confirm = false;
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
  userModel.loadAllUser(function(error, resultUser){
    callback(error, resultUser);
  });
};
