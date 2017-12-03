

var heartModel = require('../models/heart.model');


exports.createHeart = function(email, callback){
  var resultObject = new Object({});

  heartModel.selectUserHeart(email, function(error, heartObject){
    console.log(heartObject);
    if(heartObject.data.length > 0){
      resultObject.code = 1;
      resultObject.message = "하트가 이미 존재합니다.";
    }else{
      heartModel.insertHeartByEmail(email, function(error, heartObject){
        if(error){
          resultObject.code = 2;
          resultObject.message = "데이터베이스 오류입니다.";
        }else{
          resultObject.code = 0;
          resultObject.message = "하트가 생성되었습니다.";
        }
        callback(error, resultObject);
      });
    }
  });

};

exports.loadUserHeart = function(email, callback){
  heartModel.selectUserHeart(email, function(error, heartObject){
    callback(error, heartObject);
  });
};

exports.loadUserHeartLog = function(email, callback){
  heartModel.selectUserHeartLog(email, function(error, heartObject){
    callback(error, heartObject);
  });
};

exports.changeHeart = function(email, changeNum, callback) {
  var resultObject = new Object({});

  var log = email + "의 하트가 " + changeNum + "만큼 변경 되었습니다.";

  heartModel.insertHeartLog(email, Number(changeNum), log, function(error, resultLog){
    if(error){
      resultObject.code = 1;
      resultObject.message = "데이터베이스 오류입니다.";

      callback(true, resultObject);
    }else{
      heartModel.updateHeart(email, changeNum, function(error, resultUpdate){
        if(error){
          resultObject.code = 2;

          callback(true, resultObject);
        }else{
          heartModel.selectUserHeart(email, function(error, resultHeart){
            if(error){
              resultObject.code = 3;
              resultObject.message = "하트가 변경되었습니다. 하트를 불러오는데 실패하였습니다.";

              callback(true, resultObject);
            }else{
              resultObject.code = 0;
              resultObject.message = "하트가 변경되었습니다.";

              var dataObject = new Object({});

              dataObject.email = email;
              dataObject.heartNum = resultHeart.data[0].heartNum;

              resultObject.data = dataObject;

              callback(null, resultObject);
            }
          });
        }
      });
    }
  });
};
