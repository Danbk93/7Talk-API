
var matchingModel = require('../models/matching.model');
var recommendModel = require('../models/recommend.model');

var heartCtrler = require('../controllers/heart.ctrl');


exports.acceptMatch = function(email, oppositeEmail, callback){
  var resultObject = new Object({});

  matchingModel.addMatching(email, oppositeEmail, function(error, resultMatch){
    console.log(resultMatch);

    if(resultMatch.code === 0){
      heartCtrler.changeHeart(email, -1, function(error, heartObject){
        resultObject.code = 0;
        resultObject.message = "매칭 수락에 성공하였습니다.";

        callback(error, resultObject);
      });
    }else{
      resultObject.code = 1;
      resultObject.message = "매칭 수락에 실패하였습니다.";

      callback(error, resultObject);
    }
  });
};

exports.rejectMatch = function(email, oppositeEmail, callback){
  console.log("rejectMatch");
  console.log(oppositeEmail);
  var resultObject = new Object({});

  recommendModel.deleteInvitationAlert(email, oppositeEmail, function(error, resultDelete){
    if(resultDelete.code === 0){
      resultObject.code = 0;
      resultObject.message = "매칭 거절에 성공하였습니다.";

      callback(true, resultObject);
    }else{
      resultObject.code = 1;
      resultObject.message = "매칭 거절에 실패하였습니다."

      callback(null, resultObject);
    }
  });


};
