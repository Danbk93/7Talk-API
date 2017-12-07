
var calcSimilarityRate = require('../js/calc_similarity_rate');

var recommendModel = require('../models/recommend.model');

exports.startBlindChat = function(email, callback){
  var resultObject = new Object({});

  calcSimilarityRate.calcSimilarityRate(email, function(error, userObject){
    var oppositeUserArray = userObject.emailList;
    // TODO modify variables
    var similarityArray = [7, 8, 9];

    if(error){
      console.log(error);
    }else{
      recommendModel.startMatching(email, oppositeUserArray, similarityArray, function(error, resultObject){
        console.log(error);
        callback(null, resultObject);
      });
    }
  });

  callback(null, resultObject);
};

exports.askAcceptAlarm = function(oppositeEmail, callback){
  recommendModel.loadAlert(oppositeEmail, function(error, resultObject){
    callback(error, resultObject);
  });
};
