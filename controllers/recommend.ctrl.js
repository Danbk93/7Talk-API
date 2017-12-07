
var matchingAlgorithm = require('../js/matching_algorithm');

var recommendModel = require('../models/recommend.model');

exports.startBlindChat = function(email, callback){
  var resultObject = new Object({});

  matchingAlgorithm.matchingAlgorithm(email, function(error, userObject){
    var oppositeUserArray = userObject.emailList;
    // TODO modify variables
    var similarityArray = [7, 8, 9];

    if(error){
      console.log(error);
    }else{
      recommendModel.addRecommend(email, oppositeUserArray, similarityArray, function(error, resultObject){
        console.log(error);
        callback(null, resultObject);
      });
    }
  })

  callback(null, resultObject);
};
